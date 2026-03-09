export default function parseRIS(content) {
  const records = content.split(/\nER\s{0,2}-/).map(r => r.trim()).filter(Boolean);
  return records.map((record) => {
    const paper = { title: "", authors: "", journal: "", year: new Date().getFullYear(), tags: [], group: "导入文献", cited: 0 };
    record.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([A-Z0-9]{2})\s{0,2}-\s*(.*)$/);
      if (!m) return;
      const [, tag, value] = m;
      if (tag === "TI") paper.title = value;
      if (tag === "AU") paper.authors = paper.authors ? `${paper.authors}; ${value}` : value;
      if (tag === "JO" || tag === "T2") paper.journal = value;
      if (tag === "PY" || tag === "Y1") paper.year = parseInt(value, 10) || paper.year;
      if (tag === "KW") paper.tags.push(value);
    });
    return paper;
  }).filter(p => p.title);
}
