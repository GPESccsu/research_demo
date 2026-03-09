// ═══════════════════════════════════════════════════════════
// ollamaService.js — Ollama local model discovery
// ═══════════════════════════════════════════════════════════

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export async function fetchOllamaModels(ollamaUrl) {
  try {
    const queryUrl = `${API_BASE_URL}/api/ollama/models?url=${encodeURIComponent(ollamaUrl)}`;
    const res = await fetch(queryUrl);
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
