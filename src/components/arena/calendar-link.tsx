"use client";

import { CalendarDays } from "lucide-react";

/** Local calendar download: does not register the participant or send a message. */
export function CalendarLink({
  title,
  opensAt,
  closesAt,
  href,
}: {
  title: string;
  opensAt: string;
  closesAt: string | null;
  href: string;
}) {
  return (
    <button
      type="button"
      className="ae-calendar-link"
      onClick={() => {
        const stamp = (date: string) =>
          new Date(date)
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}/, "");
        const escape = (s: string) =>
          s
            .replace(/\\/g, "\\\\")
            .replace(/\r?\n/g, "\\n")
            .replace(/[,;]/g, "\\$&");
        const content = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Major ECN//EVC Arena//FR",
          "BEGIN:VEVENT",
          `UID:${stamp(opensAt)}-${encodeURIComponent(href)}@evc-arena`,
          `DTSTAMP:${stamp(new Date().toISOString())}`,
          `DTSTART:${stamp(opensAt)}`,
          ...(closesAt ? [`DTEND:${stamp(closesAt)}`] : []),
          `SUMMARY:${escape(title)}`,
          `URL:${new URL(href, window.location.origin).href}`,
          "END:VEVENT",
          "END:VCALENDAR",
          "",
        ].join("\r\n");
        const url = URL.createObjectURL(
          new Blob([content], { type: "text/calendar;charset=utf-8" }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = "evc-arena-prochaine-manche.ics";
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Leave enough time for the browser's download manager to consume the blob.
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }}
    >
      <CalendarDays aria-hidden />
      Ajouter la date au calendrier
    </button>
  );
}
