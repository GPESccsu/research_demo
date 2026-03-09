// ═══════════════════════════════════════════════════════════
// aiService.js — Backend AI caller (callAI / callAIJSON / callAIChat)
// ═══════════════════════════════════════════════════════════

import { apiRequest } from "./apiClient";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

// ── Universal AI Caller ──
export async function callAI(config, promptKey, userMessage, maxTokens) {
  const tokens = maxTokens || config.maxTokens || 1000;

  try {
    const data = await apiRequest(`${API_BASE_URL}/api/ai/call`, {
      body: { config, promptKey, userMessage, maxTokens: tokens },
    });
    return data.result || "";
  } catch (err) {
    console.error("AI call error:", err);
    return null;
  }
}

export async function callAIJSON(config, promptKey, userMessage, maxTokens) {
  const raw = await callAI(config, promptKey, userMessage, maxTokens);
  if (!raw) return null;
  const cleaned = raw.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function callAIChat(config, promptKey, messages) {
  try {
    const data = await apiRequest(`${API_BASE_URL}/api/ai/chat`, {
      body: { config, promptKey, messages },
    });
    return data.result || null;
  } catch (err) {
    console.error("Chat error:", err);
    return null;
  }
}
