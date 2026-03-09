// ═══════════════════════════════════════════════════════════
// ollamaService.js — Ollama local model discovery
// ═══════════════════════════════════════════════════════════

export async function fetchOllamaModels(ollamaUrl) {
  try {
    const res = await fetch(`${ollamaUrl}/api/tags`);
    const data = await res.json();
    if (data.models) {
      return data.models.map(m => ({
        id: m.name,
        name: m.name,
        desc: `${(m.size / 1e9).toFixed(1)}GB`,
      }));
    }
    return [];
  } catch {
    return [];
  }
}
