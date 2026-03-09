export default function parseBibTeX(content) {
  const entries = content.split(/@\w+\s*\{/).slice(1);
  return entries.map((entry) => {
    const getField = (field) => {
      const r = new RegExp(`${field}\\s*=\\s*[{\"]([^}\"]+)`, "i");
      return entry.match(r)?.[1]?.trim() || "";
    };
    const keywords = getField("keywords").split(/[;,]/).map(s => s.trim()).filter(Boolean);
    return {
      title: getField("title"),
      authors: getField("author"),
      journal: getField("journal") || getField("booktitle"),
      year: parseInt(getField("year"), 10) || new Date().getFullYear(),
      tags: keywords,
      group: "导入文献",
      cited: 0,
    };
  }).filter(p => p.title);
}
