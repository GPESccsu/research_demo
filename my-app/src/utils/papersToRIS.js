export default function papersToRIS(papers) {
  return papers.map((p) => [
    "TY  - JOUR",
    `TI  - ${p.title}`,
    ...(String(p.authors || "").split(";").map(a => a.trim()).filter(Boolean).map(a => `AU  - ${a}`)),
    `JO  - ${p.journal || ""}`,
    `PY  - ${p.year || ""}`,
    ...(p.tags || []).map(t => `KW  - ${t}`),
    "ER  -",
  ].join("\n")).join("\n\n");
}
