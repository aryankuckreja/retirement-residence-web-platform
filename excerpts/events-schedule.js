// Excerpt: which calendars and flyers are visible on a given day
// (logic from the Events page, rewritten as a pure function for readability).
//
// Rules
//   - Calendars: show the current month and any later months (as "coming up" tabs).
//     Past months retire automatically; if nothing is current, keep the newest one.
//   - Flyers: an undated flyer stays until removed; a dated flyer hides the day after the event.

export function visibleEvents(data, today /* "YYYY-MM-DD" */) {
  const ym = today.slice(0, 7);

  const calendars = (data.calendars || [])
    .filter((c) => c && c.file)
    .sort((a, b) => ((a.month || "") < (b.month || "") ? -1 : 1));

  let shown = calendars.filter((c) => !c.month || c.month >= ym);
  if (shown.length === 0 && calendars.length) shown = [calendars[calendars.length - 1]];

  const flyers = (data.flyers || [])
    .filter((f) => f && f.file && (!f.date || f.date >= today))
    .sort((a, b) => ((a.date || "9999") < (b.date || "9999") ? -1 : 1));

  return { calendars: shown, flyers };
}

// Example
// visibleEvents(
//   { calendars: [{ month: "2026-11", file: "nov.png" }, { month: "2026-12", file: "dec.png" }],
//     flyers:    [{ title: "Remembrance Day", file: "r.png", date: "2026-11-11" }] },
//   "2026-11-20"
// )
// -> { calendars: [nov, dec], flyers: [] }
