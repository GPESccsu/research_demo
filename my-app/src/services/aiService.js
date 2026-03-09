// ═══════════════════════════════════════════════════════════
// aiService.js — Universal AI caller (callAI / callAIJSON / callAIChat)
// ═══════════════════════════════════════════════════════════

import { apiRequest } from "./apiClient.js";
import { AI_PROVIDERS } from "./promptService.js";

// ── Universal AI Caller ──
export async function callAI(config, systemPrompt, userMessage, maxTokens) {
  const provider = AI_PROVIDERS[config.provider];
  if (!provider) return null;
  const tokens = maxTokens || config.maxTokens || 1000;
  const fullSystem = config.systemPromptPrefix ? `${config.systemPromptPrefix}\n\n${systemPrompt}` : systemPrompt;
  const model = config.customModel || config.model;

  try {
    if (provider.format === "anthropic") {
      const data = await apiRequest(provider.baseUrl, {
        headers: config.apiKey ? { "x-api-key": config.apiKey } : {},
        body: { model, max_tokens: tokens, system: fullSystem, messages: [{ role: "user", content: userMessage }] },
      });
      return data.content?.map(b => b.text || "").join("\n") || "";
    } else {
      // OpenAI-compatible (Ollama, Groq, Together, OpenRouter, SiliconFlow)
      const url = config.provider === "ollama" ? `${config.ollamaUrl}/v1/chat/completions` : provider.baseUrl;
      const headers = {};
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      if (config.provider === "openrouter") {
        headers["HTTP-Referer"] = "https://sciflow.app";
        headers["X-Title"] = "SciFlow";
      }
      const data = await apiRequest(url, {
        headers,
        body: { model, messages: [{ role: "system", content: fullSystem }, { role: "user", content: userMessage }], max_tokens: tokens, temperature: config.temperature },
      });
      return data.choices?.[0]?.message?.content || "";
    }
  } catch (err) {
    console.error(`AI (${provider.name}) error:`, err);
    return null;
  }
}

export async function callAIJSON(config, systemPrompt, userMessage, maxTokens) {
  const raw = await callAI(config, systemPrompt, userMessage, maxTokens);
  if (!raw) return null;
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { return null; }
}

export async function callAIChat(config, systemPrompt, messages) {
  const provider = AI_PROVIDERS[config.provider];
  if (!provider) return null;
  const model = config.customModel || config.model;
  const fullSystem = config.systemPromptPrefix ? `${config.systemPromptPrefix}\n\n${systemPrompt}` : systemPrompt;
  try {
    if (provider.format === "anthropic") {
      const data = await apiRequest(provider.baseUrl, {
        headers: config.apiKey ? { "x-api-key": config.apiKey } : {},
        body: { model, max_tokens: config.maxTokens || 1000, system: fullSystem, messages },
      });
      return data.content?.map(b => b.text || "").join("\n") || null;
    } else {
      const url = config.provider === "ollama" ? `${config.ollamaUrl}/v1/chat/completions` : provider.baseUrl;
      const headers = {};
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      if (config.provider === "openrouter") { headers["HTTP-Referer"] = "https://sciflow.app"; headers["X-Title"] = "SciFlow"; }
      const data = await apiRequest(url, {
        headers,
        body: { model, messages: [{ role: "system", content: fullSystem }, ...messages], max_tokens: config.maxTokens || 1000, temperature: config.temperature },
      });
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (err) { console.error("Chat error:", err); return null; }
}
