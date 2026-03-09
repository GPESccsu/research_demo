// ═══════════════════════════════════════════════════════════
// apiClient.js — Generic HTTP request helper
// ═══════════════════════════════════════════════════════════

export async function apiRequest(url, { method = "POST", headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error?.message || JSON.stringify(data.error));
  }
  return data;
}
