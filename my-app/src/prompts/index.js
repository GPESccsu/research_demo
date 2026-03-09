// ═══════════════════════════════════════════════════════════
// prompts/index.js — Centralized AI prompt strings
// ═══════════════════════════════════════════════════════════

import keywordExpanderPrompt from "./keyword_expander.md?raw";
import writingAssistantPrompt from "./writing_assistant.md?raw";
import experimentDiagnosisPrompt from "./experiment_diagnosis.md?raw";
import paperSummaryPrompt from "./paper_summary.md?raw";
import sentenceComparePrompt from "./sentence_compare.md?raw";

export const PROMPTS = {
  // ── Test connection ──
  TEST_SYSTEM: "You are a test assistant.",
  TEST_USER: "Say 'connection successful' in Chinese, keep it under 10 words.",

  // ── Topic / keyword expansion ──
  KEYWORD_EXPANDER: keywordExpanderPrompt.trim(),

  // ── Knowledge / paper summary ──
  PAPER_SUMMARY: paperSummaryPrompt.trim(),

  // ── Experiment diagnosis ──
  EXPERIMENT_DIAGNOSIS: experimentDiagnosisPrompt.trim(),

  // ── Writing analysis (JSON) ──
  WRITING_ANALYSIS: writingAssistantPrompt.trim(),

  // ── Writing Q&A ──
  WRITING_QA: "锌空气电池论文写作助手。中文≤150字。",

  // ── Sentence compare (贼哥句子比较器) ──
  SENTENCE_COMPARE: sentenceComparePrompt.trim(),

  // ── AI Chat assistant ──
  CHAT_ASSISTANT: "你是SciFlow AI科研助手。专长：材料科学、电化学、论文写作。中文≤200字。",
};
