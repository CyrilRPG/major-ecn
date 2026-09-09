/** Fill the demonstration from existing platform questions, without inventing answers. */
export async function completeDemoRounds(db, rounds) {
  const themes = [
    ["vascularite", "lupus", "sclérodermie", "Sjögren"],
    ["syndrome inflammatoire", "auto-immun", "endocardite", "tuberculose"],
    ["anémie", "hyponatrémie", "hypercalcémie", "insuffisance surrénalienne"],
  ];
  const used = new Set(
    rounds.flatMap((r) =>
      r.questions.map((q) => q.enonce.trim().toLowerCase()),
    ),
  );
  const strip = (value) =>
    String(value ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  for (const r of rounds) {
    for (const term of themes[r.number - 1]) {
      if (r.questions.length >= 20) break;
      const { data, error } = await db
        .from("qcm_questions")
        .select(
          "id,enonce,format,images,correction_generale,qcm_items(lettre,enonce,is_correct,justification),qcm_series(vignette)",
        )
        .ilike("enonce", `%${term}%`)
        .order("id")
        .limit(80);
      if (error) throw new Error(error.message);
      for (const q of data ?? []) {
        if (r.questions.length >= 20) break;
        const enonce = strip(q.enonce);
        const items = [...(q.qcm_items ?? [])]
          .sort((a, b) => a.lettre.localeCompare(b.lettre))
          .map((item, i) => ({
            lettre: String.fromCharCode(65 + i),
            enonce: strip(item.enonce),
            is_correct: !!item.is_correct,
            justification: strip(item.justification),
            indispensable: false,
            inacceptable: false,
          }));
        const correct = items.filter((i) => i.is_correct).length;
        if (
          q.format === "qroc" ||
          used.has(enonce.toLowerCase()) ||
          items.length < 2 ||
          items.length > 5 ||
          !correct ||
          !strip(q.correction_generale) ||
          items.some((i) => !i.enonce || !i.justification)
        )
          continue;
        // Avoid extracting a follow-up question from a dependent clinical case.
        if (
          q.qcm_series?.vignette ||
          /précédent|ce patient|cette patiente|vous avez|vous retenez|ci-dessus/i.test(
            enonce,
          )
        )
          continue;
        r.questions.push({
          type: correct === 1 ? "QRU" : "QRM",
          enonce,
          items,
          explanation: strip(q.correction_generale),
          pieges: "",
          erreurs: "",
          refs: "Banque de questions Major ECN",
          source_question_id: q.id,
          images: q.images ?? [],
        });
        used.add(enonce.toLowerCase());
      }
    }
    if (r.questions.length !== 20)
      throw new Error(
        `M${r.number} : ${r.questions.length}/20 questions. Compléter la sélection avant de créer la démonstration.`,
      );
  }
  return rounds;
}
