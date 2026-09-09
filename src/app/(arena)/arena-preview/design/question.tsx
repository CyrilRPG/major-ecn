"use client";
import { useState } from "react";
import { QuestionView } from "@/components/arena/question-view";
import type { PublicQuestion } from "@/lib/arena/types";

const question: PublicQuestion = {
  id: "visual-fixture",
  order_index: 0,
  type: "QRM",
  expected_count: null,
  weight: 1,
  duration_seconds: 60,
  vignette:
    "Femme de 74 ans, céphalées temporales récentes, hyperesthésie du cuir chevelu, VS à 85 mm.",
  enonce:
    "Concernant l’artérite à cellules géantes (maladie de Horton), quelles sont les propositions exactes ?",
  images: [],
  items: [
    {
      lettre: "A",
      enonce: "Elle touche préférentiellement les sujets de plus de 50 ans.",
    },
    {
      lettre: "B",
      enonce: "La vitesse de sédimentation est habituellement normale.",
    },
    {
      lettre: "C",
      enonce:
        "Une claudication intermittente de la mâchoire est très évocatrice.",
    },
    {
      lettre: "D",
      enonce:
        "La corticothérapie est débutée sans attendre le résultat de la biopsie.",
    },
    {
      lettre: "E",
      enonce: "Une biopsie d’artère temporale peut contribuer au diagnostic.",
    },
  ],
};
export function DesignQuestion() {
  const [selected, setSelected] = useState(["B"]);
  const [index, setIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [marked, setMarked] = useState(false);
  return (
    <QuestionView
      key={index}
      question={question}
      roundNumber={1}
      roundTotal={3}
      roundTheme="Vascularités et maladies systémiques"
      questionIndex={index}
      questionTotal={20}
      clock="19:12"
      progress={0.35}
      urgent={false}
      selected={selected}
      pending={false}
      canValidate
      confirmationRequired={!confirmed}
      baremeLabel="Barème CNG"
      error={null}
      marked={marked}
      onMark={() => setMarked(!marked)}
      onToggle={(letter) =>
        setSelected((prev) =>
          prev.includes(letter)
            ? prev.filter((x) => x !== letter)
            : [...prev, letter],
        )
      }
      onValidate={() => {
        setConfirmed(true);
        setSelected([]);
        setMarked(false);
        if (index === 19) window.location.assign("?state=results");
        else setIndex(index + 1);
      }}
    />
  );
}
