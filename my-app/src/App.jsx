import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { saveConfig, loadConfig, getPapers, savePapers, addPaper, deletePaper, getLogs, saveLogs, addLog, getChecklist, saveChecklist, getChatHistory, saveChatMessage, clearChatHistory, getSynonymGroups, saveSynonymGroup, deleteSynonymGroup, getClips, addClip, getDrafts, saveDraft, getUIState, saveUIState } from "./db.js";

// ═══════════════════════════════════════════════════════════
// SCIFLOW — AI-POWERED RESEARCH ASSISTANT
// With Multi-Provider AI Configuration
// ═══════════════════════════════════════════════════════════

// ── AI Provider Definitions ──
const AI_PROVIDERS = {
  anthropic: {
    id: "anthropic", name: "Anthropic Claude", icon: "🟣", type: "cloud",
    description: "Claude 系列模型，强大的学术理解与写作能力",
    baseUrl: "https://api.anthropic.com/v1/messages",
    requiresKey: true, keyPlaceholder: "sk-ant-...",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", desc: "均衡性能，推荐日常使用", default: true },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", desc: "最快响应，适合简单任务" },
    ],
    format: "anthropic",
  },
  openai: {
    id: "openai", name: "OpenAI ChatGPT", icon: "🟢", type: "cloud",
    description: "ChatGPT 系列模型，通用能力强，学术写作与代码生成优秀",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    requiresKey: true, keyPlaceholder: "sk-...",
    signupUrl: "https://platform.openai.com/api-keys",
    models: [
      { id: "gpt-4o", name: "GPT-4o", desc: "最新旗舰，多模态能力强", default: true },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "轻量快速，性价比高" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "大上下文，推理强" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", desc: "经济实惠，速度快" },
      { id: "o1-mini", name: "o1-mini", desc: "推理模型，深度思考" },
    ],
    format: "openai",
  },
  ollama: {
    id: "ollama", name: "Ollama (本地)", icon: "🦙", type: "local",
    description: "本地运行的开源模型，无需 API Key，完全私有",
    baseUrl: "http://localhost:11434",
    requiresKey: false,
    models: [
      { id: "qwen2.5:7b", name: "Qwen 2.5 7B", desc: "中文能力强，推荐", default: true },
      { id: "llama3.1:8b", name: "Llama 3.1 8B", desc: "Meta 开源模型" },
      { id: "mistral:7b", name: "Mistral 7B", desc: "欧洲开源模型" },
      { id: "deepseek-r1:7b", name: "DeepSeek R1 7B", desc: "推理能力强" },
      { id: "gemma2:9b", name: "Gemma 2 9B", desc: "Google 开源模型" },
      { id: "custom", name: "自定义模型...", desc: "输入任意已下载的模型名" },
    ],
    format: "openai",
  },
  groq: {
    id: "groq", name: "Groq (免费)", icon: "⚡", type: "cloud-free",
    description: "极速推理，免费额度慷慨，需注册获取 API Key",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    requiresKey: true, keyPlaceholder: "gsk_...",
    signupUrl: "https://console.groq.com",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", desc: "免费，性能强劲", default: true },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", desc: "免费，上下文长" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", desc: "免费，响应快" },
    ],
    format: "openai",
  },
  together: {
    id: "together", name: "Together AI (免费)", icon: "🤝", type: "cloud-free",
    description: "每月免费额度，支持多种开源模型",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    requiresKey: true, keyPlaceholder: "tog_...",
    signupUrl: "https://api.together.xyz",
    models: [
      { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", name: "Qwen 2.5 72B", desc: "中文最佳", default: true },
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B", desc: "综合能力强" },
      { id: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B", name: "DeepSeek R1 70B", desc: "推理能力强" },
    ],
    format: "openai",
  },
  openrouter: {
    id: "openrouter", name: "OpenRouter (免费)", icon: "🔀", type: "cloud-free",
    description: "聚合多家模型，部分模型免费使用",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    requiresKey: true, keyPlaceholder: "sk-or-...",
    signupUrl: "https://openrouter.ai",
    models: [
      { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B (Free)", desc: "免费，中文强", default: true },
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", desc: "免费" },
      { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B (Free)", desc: "免费" },
    ],
    format: "openai",
  },
  siliconflow: {
    id: "siliconflow", name: "SiliconFlow (免费)", icon: "🌊", type: "cloud-free",
    description: "国内平台，免费额度，中文模型体验好",
    baseUrl: "https://api.siliconflow.cn/v1/chat/completions",
    requiresKey: true, keyPlaceholder: "sk-...",
    signupUrl: "https://cloud.siliconflow.cn",
    models: [
      { id: "Qwen/Qwen2.5-7B-Instruct", name: "Qwen 2.5 7B", desc: "免费，中文优秀", default: true },
      { id: "THUDM/glm-4-9b-chat", name: "GLM-4 9B", desc: "免费，清华开源" },
      { id: "deepseek-ai/DeepSeek-V2.5", name: "DeepSeek V2.5", desc: "免费" },
    ],
    format: "openai",
  },
};

const DEFAULT_CONFIG = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-sonnet-4-20250514",
  customModel: "",
  ollamaUrl: "http://localhost:11434",
  temperature: 0.7,
  maxTokens: 1000,
  systemPromptPrefix: "",
};

// ── AI Config Context ──
const AIConfigContext = createContext(null);

function useAIConfig() {
  return useContext(AIConfigContext);
}

// ── Universal AI Caller ──
async function callAI(config, systemPrompt, userMessage, maxTokens) {
  const provider = AI_PROVIDERS[config.provider];
  if (!provider) return null;
  const tokens = maxTokens || config.maxTokens || 1000;
  const fullSystem = config.systemPromptPrefix ? `${config.systemPromptPrefix}\n\n${systemPrompt}` : systemPrompt;
  const model = config.customModel || config.model;

  try {
    if (provider.format === "anthropic") {
      const res = await fetch(provider.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(config.apiKey ? { "x-api-key": config.apiKey } : {}) },
        body: JSON.stringify({ model, max_tokens: tokens, system: fullSystem, messages: [{ role: "user", content: userMessage }] }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API Error");
      return data.content?.map(b => b.text || "").join("\n") || "";
    } else {
      // OpenAI-compatible (Ollama, Groq, Together, OpenRouter, SiliconFlow)
      const url = config.provider === "ollama" ? `${config.ollamaUrl}/v1/chat/completions` : provider.baseUrl;
      const headers = { "Content-Type": "application/json" };
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      if (config.provider === "openrouter") {
        headers["HTTP-Referer"] = "https://sciflow.app";
        headers["X-Title"] = "SciFlow";
      }
      const res = await fetch(url, {
        method: "POST", headers,
        body: JSON.stringify({ model, messages: [{ role: "system", content: fullSystem }, { role: "user", content: userMessage }], max_tokens: tokens, temperature: config.temperature }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || JSON.stringify(data.error));
      return data.choices?.[0]?.message?.content || "";
    }
  } catch (err) {
    console.error(`AI (${provider.name}) error:`, err);
    return null;
  }
}

async function callAIJSON(config, systemPrompt, userMessage, maxTokens) {
  const raw = await callAI(config, systemPrompt, userMessage, maxTokens);
  if (!raw) return null;
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { return null; }
}

async function callAIChat(config, systemPrompt, messages) {
  const provider = AI_PROVIDERS[config.provider];
  if (!provider) return null;
  const model = config.customModel || config.model;
  const fullSystem = config.systemPromptPrefix ? `${config.systemPromptPrefix}\n\n${systemPrompt}` : systemPrompt;
  try {
    if (provider.format === "anthropic") {
      const res = await fetch(provider.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(config.apiKey ? { "x-api-key": config.apiKey } : {}) },
        body: JSON.stringify({ model, max_tokens: config.maxTokens || 1000, system: fullSystem, messages }),
      });
      const data = await res.json();
      return data.content?.map(b => b.text || "").join("\n") || null;
    } else {
      const url = config.provider === "ollama" ? `${config.ollamaUrl}/v1/chat/completions` : provider.baseUrl;
      const headers = { "Content-Type": "application/json" };
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;
      if (config.provider === "openrouter") { headers["HTTP-Referer"] = "https://sciflow.app"; headers["X-Title"] = "SciFlow"; }
      const res = await fetch(url, {
        method: "POST", headers,
        body: JSON.stringify({ model, messages: [{ role: "system", content: fullSystem }, ...messages], max_tokens: config.maxTokens || 1000, temperature: config.temperature }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (err) { console.error("Chat error:", err); return null; }
}

// ── Icons ──
const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Book: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  Beaker: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Database: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>,
  Clipboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>,
  Folder: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>,
  ArrowRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  Globe: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Sparkle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  Send: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Bot: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/></svg>,
  Wand: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="m3 21 9-9"/></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ExternalLink: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  AlertCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Loader: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

function TypingDots() { return <span className="typing-dots"><span className="dot"/><span className="dot"/><span className="dot"/></span>; }
function AIBadge({ small }) { return <span className={`ai-badge ${small?'ai-badge-sm':''}`}><Icons.Sparkle/> AI</span>; }

// ── Data ──
const MODULES = [
  { id:"topic", label:"选题发现", labelEn:"Topic Discovery", icon:Icons.Search, color:"#E8A838" },
  { id:"knowledge", label:"知识库", labelEn:"Knowledge Base", icon:Icons.Database, color:"#5BA4E6" },
  { id:"reading", label:"阅读素材", labelEn:"Reading & Clips", icon:Icons.Book, color:"#6DC584" },
  { id:"experiment", label:"实验设计", labelEn:"Experiment Design", icon:Icons.Beaker, color:"#D46B8C" },
  { id:"writing", label:"写作助手", labelEn:"Writing Assistant", icon:Icons.Edit, color:"#9B7FD4" },
  { id:"checklist", label:"自查清单", labelEn:"Checklist", icon:Icons.Check, color:"#E07B54" },
  { id:"lablog", label:"实验记录", labelEn:"Lab Log", icon:Icons.Clipboard, color:"#5BBFB5" },
];
const AI_MODS = ["topic","writing","experiment"];
const PAPERS = [
  { id:1,title:"Co₃O₄ Nanosheets as Efficient OER Catalysts",authors:"Zhang, Y. et al.",journal:"ACS Nano",year:2024,tags:["Co基催化剂","OER","纳米片"],cited:47,group:"核心文献" },
  { id:2,title:"N-doped Carbon for Bifunctional Zn-Air Batteries",authors:"Li, H. et al.",journal:"Adv. Mater.",year:2023,tags:["N掺杂","双功能","碳材料"],cited:112,group:"核心文献" },
  { id:3,title:"MOF-derived Electrocatalysts: A Review",authors:"Wang, J. et al.",journal:"Chem. Rev.",year:2024,tags:["MOF","综述","电催化"],cited:89,group:"综述文献" },
  { id:4,title:"Defect Engineering in Metal Oxides for ORR",authors:"Chen, M. et al.",journal:"Nature Commun.",year:2023,tags:["缺陷工程","ORR","金属氧化物"],cited:65,group:"核心文献" },
  { id:5,title:"Single-Atom Catalysts for Oxygen Electrocatalysis",authors:"Liu, S. et al.",journal:"Joule",year:2024,tags:["单原子催化","OER","ORR"],cited:203,group:"高被引" },
  { id:6,title:"Perovskite Oxides in Metal-Air Batteries",authors:"Kim, D. et al.",journal:"Energy Environ. Sci.",year:2023,tags:["钙钛矿","金属空气电池"],cited:78,group:"拓展阅读" },
];
const CK_DATA = [
  { category:"格式规范", items:[{text:"标题格式符合目标期刊要求",done:true},{text:"摘要字数在规定范围内",done:true},{text:"关键词数量与格式正确",done:false},{text:"参考文献格式统一",done:false}]},
  { category:"图表检查", items:[{text:"所有图片分辨率 ≥ 300 DPI",done:true},{text:"图表编号与正文引用一致",done:false},{text:"坐标轴标签与单位完整",done:true},{text:"配色对色觉障碍友好",done:false}]},
  { category:"语言与逻辑", items:[{text:"无语法与拼写错误",done:false},{text:"每段主题句明确",done:true},{text:"因果关系表述准确",done:false},{text:"避免过度概括性表述",done:false}]},
  { category:"数据与引用", items:[{text:"所有数据可追溯至原始记录",done:true},{text:"统计方法描述完整",done:false},{text:"引用文献均已阅读原文",done:false},{text:"无自引过多问题",done:true}]},
];

const DEFAULT_TOPICS = [
  { id: 1, name: "锌空气电池催化剂研究", status: "进行中" },
];

function parseRIS(content) {
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

function parseBibTeX(content) {
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

function papersToRIS(papers) {
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

// ═══════════ STYLES ═══════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
:root{--bg-deep:#0B0D14;--bg-surface:#12141E;--bg-elevated:#1A1D2B;--bg-hover:#222538;--border:#262A3E;--border-bright:#3A3F5C;--text-primary:#E6E8F0;--text-secondary:#8E91AB;--text-muted:#555874;--accent-amber:#E8A838;--accent-blue:#5BA4E6;--accent-green:#6DC584;--accent-pink:#D46B8C;--accent-purple:#9B7FD4;--accent-orange:#E07B54;--accent-teal:#5BBFB5;--ai-glow:#A78BFA;--radius-sm:8px;--radius-md:12px;--radius-lg:18px;--font-sans:'Noto Sans SC',system-ui,sans-serif;--font-serif:'Source Serif 4',Georgia,serif;--font-mono:'JetBrains Mono',monospace}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg-deep);color:var(--text-primary);font-family:var(--font-sans);overflow:hidden}
.app-container{display:flex;height:100vh;width:100vw;overflow:hidden}
.sidebar{width:264px;min-width:264px;background:var(--bg-surface);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:100;transition:transform .3s cubic-bezier(.4,0,.2,1)}
@media(max-width:960px){.sidebar{position:fixed;left:0;top:0;height:100vh;transform:translateX(-100%)}.sidebar.open{transform:translateX(0)}.sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99}}
.sidebar-header{padding:22px 20px 14px;border-bottom:1px solid var(--border)}.sidebar-logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#E8A838,#D4822A 50%,#9B7FD4);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;box-shadow:0 2px 16px rgba(232,168,56,.35)}
.logo-text{font-family:var(--font-serif);font-size:23px;font-weight:700;background:linear-gradient(135deg,#E6E8F0 30%,#8E91AB);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.project-selector{margin-top:14px;padding:9px 12px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:border-color .2s}.project-selector:hover{border-color:var(--border-bright)}
.project-name{font-weight:500}.project-tag{font-size:10px;padding:2px 7px;background:rgba(232,168,56,.14);color:var(--accent-amber);border-radius:4px;font-weight:600}
.sidebar-nav{flex:1;padding:10px 8px;overflow-y:auto}.nav-section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--text-muted);padding:10px 12px 6px}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--radius-sm);cursor:pointer;transition:all .15s;position:relative;color:var(--text-secondary);font-size:13.5px;margin:1px 0}
.nav-item:hover{background:var(--bg-hover);color:var(--text-primary)}.nav-item.active{background:var(--bg-hover);color:var(--text-primary);font-weight:500}
.nav-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sidebar-footer{padding:14px 16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--accent-purple),var(--accent-blue));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#fff}
.user-name{font-size:13px;font-weight:500}.user-role{font-size:11px;color:var(--text-muted)}
.main-content{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{height:54px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:14px;background:var(--bg-surface);flex-shrink:0}
.mobile-menu-btn{display:none;background:none;border:none;color:var(--text-secondary);cursor:pointer}@media(max-width:960px){.mobile-menu-btn{display:block}}
.breadcrumb{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-muted)}.breadcrumb-current{color:var(--text-primary);font-weight:500}
.topbar-actions{margin-left:auto;display:flex;align-items:center;gap:8px}
.topbar-search{position:relative}.topbar-search input{background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 12px 7px 34px;color:var(--text-primary);font-size:13px;width:200px;outline:none;transition:all .25s;font-family:var(--font-sans)}.topbar-search input:focus{border-color:var(--accent-amber);width:280px}.topbar-search svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted)}
.page-content{flex:1;overflow-y:auto;padding:24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.panel{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden}.panel-header{padding:14px 18px;border-bottom:1px solid var(--border);font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}.panel-body{padding:16px 18px}
.btn{padding:8px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .15s;font-family:var(--font-sans);display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.btn-primary{background:var(--accent-amber);color:#000}.btn-primary:hover{background:#F0B44A;transform:translateY(-1px)}
.btn-ai{background:linear-gradient(135deg,#7C3AED,#A78BFA);color:#fff;box-shadow:0 2px 12px rgba(167,139,250,.3)}.btn-ai:hover{box-shadow:0 4px 20px rgba(167,139,250,.45);transform:translateY(-1px)}
.btn-secondary{background:var(--bg-elevated);color:var(--text-primary);border:1px solid var(--border)}.btn-secondary:hover{border-color:var(--border-bright)}
.btn-sm{padding:6px 12px;font-size:12px}.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
.btn-success{background:var(--accent-green);color:#000}.btn-danger{background:var(--accent-pink);color:#fff}
.input-field{flex:1;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 14px;color:var(--text-primary);font-size:13px;outline:none;font-family:var(--font-sans);transition:border-color .2s;width:100%}.input-field:focus{border-color:var(--ai-glow);box-shadow:0 0 0 3px rgba(167,139,250,.1)}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.section-title{font-size:16px;font-weight:600}
.section-action{font-size:12px;color:var(--accent-amber);cursor:pointer;display:flex;align-items:center;gap:4px;font-weight:500}
.ai-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(167,139,250,.15));border:1px solid rgba(167,139,250,.25);border-radius:6px;font-size:11px;font-weight:600;color:var(--ai-glow)}.ai-badge-sm{padding:2px 6px;font-size:10px}.ai-badge svg{width:10px;height:10px}
.typing-dots{display:inline-flex;gap:3px;align-items:center;padding:4px 0}.typing-dots .dot{width:6px;height:6px;border-radius:50%;background:var(--ai-glow);animation:dotPulse 1.4s infinite ease-in-out}.typing-dots .dot:nth-child(2){animation-delay:.2s}.typing-dots .dot:nth-child(3){animation-delay:.4s}
@keyframes dotPulse{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
.ai-summary-panel{background:linear-gradient(135deg,rgba(124,58,237,.06),rgba(167,139,250,.04));border:1px solid rgba(167,139,250,.2);border-radius:var(--radius-md);padding:16px 18px;margin-top:12px}
.ai-summary-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:13px;font-weight:600;color:var(--ai-glow)}.ai-summary-text{font-size:13px;line-height:1.7;color:var(--text-secondary);white-space:pre-wrap}
/* Settings page */
.settings-grid{display:grid;grid-template-columns:280px 1fr;gap:20px;min-height:500px}@media(max-width:960px){.settings-grid{grid-template-columns:1fr}}
.provider-list{display:flex;flex-direction:column;gap:6px}
.provider-card{padding:14px 16px;border-radius:var(--radius-md);border:1px solid var(--border);cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:12px;background:var(--bg-surface)}
.provider-card:hover{border-color:var(--border-bright);background:var(--bg-elevated)}
.provider-card.active{border-color:var(--ai-glow);background:rgba(167,139,250,.06);box-shadow:0 0 0 1px rgba(167,139,250,.15)}
.provider-card.active .provider-radio{border-color:var(--ai-glow);background:var(--ai-glow)}
.provider-radio{width:16px;height:16px;border-radius:50%;border:2px solid var(--border-bright);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.provider-radio::after{content:'';width:6px;height:6px;border-radius:50%;background:#fff;opacity:0;transition:opacity .2s}
.provider-card.active .provider-radio::after{opacity:1}
.provider-icon{font-size:22px;line-height:1}.provider-info{flex:1;min-width:0}
.provider-name{font-size:13px;font-weight:600;margin-bottom:1px}.provider-type{font-size:11px;color:var(--text-muted)}
.config-section{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden}
.config-section-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600}
.config-section-body{padding:20px}
.form-group{margin-bottom:18px}.form-label{font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px;display:flex;align-items:center;gap:6px}.form-hint{font-size:11px;color:var(--text-muted);margin-top:4px}
.form-row{display:flex;gap:10px;align-items:flex-end}
.model-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.model-option{padding:10px 14px;border-radius:var(--radius-sm);border:1px solid var(--border);cursor:pointer;transition:all .15s;background:var(--bg-elevated)}
.model-option:hover{border-color:var(--border-bright)}.model-option.active{border-color:var(--ai-glow);background:rgba(167,139,250,.06)}
.model-option-name{font-size:13px;font-weight:500;margin-bottom:2px}.model-option-desc{font-size:11px;color:var(--text-muted)}
.slider-row{display:flex;align-items:center;gap:12px}
.slider-row input[type=range]{flex:1;accent-color:var(--ai-glow);height:4px;cursor:pointer}
.slider-val{font-family:var(--font-mono);font-size:12px;color:var(--accent-amber);min-width:32px;text-align:right}
.test-result{padding:12px 16px;border-radius:var(--radius-sm);font-size:13px;margin-top:12px;display:flex;align-items:center;gap:8px}
.test-success{background:rgba(109,197,132,.1);border:1px solid rgba(109,197,132,.3);color:var(--accent-green)}
.test-error{background:rgba(212,107,140,.1);border:1px solid rgba(212,107,140,.3);color:var(--accent-pink)}
.test-loading{background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);color:var(--ai-glow)}
.signup-link{display:inline-flex;align-items:center;gap:4px;color:var(--accent-blue);font-size:12px;text-decoration:none;cursor:pointer}.signup-link:hover{text-decoration:underline}
/* Common page styles */
.dashboard-hero{background:linear-gradient(135deg,rgba(124,58,237,.06),rgba(232,168,56,.06) 50%,rgba(91,164,230,.04));border:1px solid var(--border);border-radius:var(--radius-lg);padding:30px 32px;margin-bottom:24px;position:relative;overflow:hidden}
.dashboard-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:250px;height:250px;background:radial-gradient(circle,rgba(167,139,250,.08),transparent 70%);border-radius:50%}
.hero-greeting{font-family:var(--font-serif);font-size:26px;font-weight:600;margin-bottom:6px;position:relative}.hero-subtitle{color:var(--text-secondary);font-size:14px;line-height:1.6;position:relative}
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:12px;margin-bottom:24px}
.stat-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 18px;transition:all .2s}.stat-card:hover{border-color:var(--border-bright);transform:translateY(-2px)}
.stat-label{font-size:12px;color:var(--text-muted);margin-bottom:6px;display:flex;align-items:center;gap:6px}.stat-value{font-size:28px;font-weight:700;font-family:var(--font-mono);letter-spacing:-1px}.stat-change{font-size:11px;margin-top:3px;font-weight:500;color:var(--accent-green)}
.module-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:10px;margin-bottom:24px}
.module-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:18px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}.module-card:hover{border-color:var(--border-bright);transform:translateY(-2px)}
.module-icon-wrap{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.module-label{font-size:14px;font-weight:600;margin-bottom:2px}.module-label-en{font-size:11px;color:var(--text-muted)}
.paper-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 18px;cursor:pointer;transition:all .15s}.paper-card:hover{border-color:var(--border-bright);background:var(--bg-elevated)}
.paper-title{font-size:14px;font-weight:600;margin-bottom:5px;line-height:1.4}.paper-meta{font-size:12px;color:var(--text-muted);margin-bottom:7px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.paper-journal{color:var(--accent-blue);font-weight:500}
.paper-tags{display:flex;gap:5px;flex-wrap:wrap}.paper-tag{font-size:11px;padding:2px 8px;border-radius:4px;background:var(--bg-deep);color:var(--text-secondary);border:1px solid var(--border)}
.topic-layout{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:960px){.topic-layout{grid-template-columns:1fr}}
.keyword-chips{display:flex;flex-wrap:wrap;gap:7px}.keyword-chip{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;font-size:12px;border:1px solid}.chip-synonym{background:rgba(232,168,56,.1);border-color:rgba(232,168,56,.3);color:var(--accent-amber)}.chip-related{background:rgba(91,164,230,.1);border-color:rgba(91,164,230,.3);color:var(--accent-blue)}.chip-cross{background:rgba(155,127,212,.1);border-color:rgba(155,127,212,.3);color:var(--accent-purple)}.chip-ai{background:rgba(167,139,250,.1);border-color:rgba(167,139,250,.3);color:var(--ai-glow)}.chip-freq{font-family:var(--font-mono);font-size:10px;opacity:.7}
.search-formula{background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;font-family:var(--font-mono);font-size:12px;line-height:1.8;color:var(--text-secondary);margin-bottom:12px;word-break:break-all}.formula-op{color:var(--accent-amber);font-weight:600}.formula-term{color:var(--accent-blue)}
.db-results{display:flex;gap:10px;flex-wrap:wrap}.db-badge{padding:6px 12px;border-radius:var(--radius-sm);font-size:12px;background:var(--bg-elevated);border:1px solid var(--border);display:flex;align-items:center;gap:6px}.db-count{font-family:var(--font-mono);font-weight:600;color:var(--accent-green)}
.kb-layout{display:grid;grid-template-columns:220px 1fr;gap:16px;min-height:500px}@media(max-width:960px){.kb-layout{grid-template-columns:1fr}}
.kb-sidebar{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;overflow-y:auto}
.group-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--radius-sm);cursor:pointer;font-size:13px;color:var(--text-secondary);transition:all .15s;margin-bottom:1px}.group-item:hover{background:var(--bg-hover);color:var(--text-primary)}.group-item.active{background:var(--bg-hover);color:var(--text-primary);font-weight:500}.group-item.dragging{opacity:.55}.group-count{margin-left:auto;font-size:11px;font-family:var(--font-mono);color:var(--text-muted)}.drag-handle{cursor:grab;color:var(--text-muted);display:inline-flex;align-items:center;padding:2px 0}.drag-handle:active{cursor:grabbing}
.writing-layout{display:grid;grid-template-columns:190px 1fr 280px;gap:14px;min-height:560px}@media(max-width:1100px){.writing-layout{grid-template-columns:1fr;min-height:auto}}
.writing-outline{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;overflow-y:auto}
.outline-item{padding:7px 10px;border-radius:var(--radius-sm);cursor:pointer;font-size:13px;color:var(--text-secondary);transition:all .15s;display:flex;align-items:center;gap:5px;margin-bottom:1px}.outline-item:hover{background:var(--bg-hover);color:var(--text-primary)}.outline-item.active{color:var(--accent-amber);font-weight:500}.outline-item.dragging{opacity:.55}.outline-sub{padding-left:20px;font-size:12px}
.writing-editor{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);display:flex;flex-direction:column;overflow:hidden}
.editor-toolbar{padding:8px 14px;border-bottom:1px solid var(--border);display:flex;gap:4px;flex-wrap:wrap;align-items:center}
.tool-btn{padding:5px 9px;border-radius:5px;background:none;border:1px solid transparent;color:var(--text-secondary);cursor:pointer;font-size:12px;transition:all .15s;font-family:var(--font-sans)}.tool-btn:hover{background:var(--bg-hover);color:var(--text-primary)}.tool-btn.ai-tool{color:var(--ai-glow)}.tool-btn.ai-tool:hover{background:rgba(167,139,250,.1)}
.editor-textarea{width:100%;min-height:200px;background:transparent;border:none;color:var(--text-primary);font-family:var(--font-serif);font-size:15px;line-height:1.85;resize:vertical;outline:none}
.writing-ai-panel{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;display:flex;flex-direction:column}
.ai-panel-header{padding:13px 16px;border-bottom:1px solid var(--border);font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}
.ai-panel-body{flex:1;overflow-y:auto;padding:12px}
.ai-suggestion{padding:12px;border-radius:var(--radius-sm);margin-bottom:8px;background:linear-gradient(135deg,rgba(124,58,237,.05),rgba(167,139,250,.03));border:1px solid rgba(167,139,250,.12);font-size:13px;line-height:1.6;color:var(--text-secondary)}
.ai-suggestion-label{font-size:11px;font-weight:600;color:var(--ai-glow);margin-bottom:6px;display:flex;align-items:center;gap:5px}
.ai-panel-input{padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:6px}.ai-panel-input input{flex:1;background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 12px;color:var(--text-primary);font-size:12px;outline:none;font-family:var(--font-sans)}.ai-panel-input input:focus{border-color:var(--ai-glow)}
.tree-node{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;transition:all .2s}.tree-node:hover{border-color:var(--border-bright)}
.tree-level-1{border-left:3px solid var(--accent-amber)}.tree-level-2{margin-left:28px;border-left:3px solid var(--accent-blue)}.tree-level-3{margin-left:56px;border-left:3px solid var(--accent-green)}
.tree-node-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px}.tree-node-text{font-size:14px;font-weight:500}.tree-node-refs{margin-top:5px;font-size:11px;color:var(--text-muted);display:flex;gap:6px;align-items:center}
.checklist-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.checklist-category{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden}
.checklist-cat-header{padding:13px 16px;border-bottom:1px solid var(--border);font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:space-between}.checklist-progress{font-size:11px;font-family:var(--font-mono);color:var(--text-muted)}
.checklist-items{padding:6px}.checklist-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--radius-sm);cursor:pointer;transition:background .15s;font-size:13px}.checklist-item:hover{background:var(--bg-hover)}
.checkbox{width:18px;height:18px;border-radius:5px;border:2px solid var(--border-bright);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}.checkbox.checked{background:var(--accent-green);border-color:var(--accent-green)}
.item-text{color:var(--text-secondary);transition:all .2s}.item-text.checked{color:var(--text-muted);text-decoration:line-through}
.log-timeline{position:relative;padding-left:28px}.log-timeline::before{content:'';position:absolute;left:11px;top:0;bottom:0;width:2px;background:var(--border)}
.log-entry{position:relative;margin-bottom:14px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px 18px;transition:all .15s}.log-entry:hover{border-color:var(--border-bright)}
.log-dot{position:absolute;left:-23px;top:16px;width:10px;height:10px;border-radius:50%;border:2px solid var(--accent-teal);background:var(--bg-deep)}
.log-time{font-size:11px;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:3px}.log-title{font-size:14px;font-weight:600;margin-bottom:3px}.log-desc{font-size:13px;color:var(--text-secondary);line-height:1.5}
.log-sample{display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:3px 8px;background:rgba(91,191,181,.1);border:1px solid rgba(91,191,181,.3);border-radius:4px;font-size:11px;font-family:var(--font-mono);color:var(--accent-teal)}
.ai-chat-fab{position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;z-index:200;background:linear-gradient(135deg,#7C3AED,#A78BFA);box-shadow:0 4px 24px rgba(124,58,237,.4);color:#fff;display:flex;align-items:center;justify-content:center;transition:all .3s}.ai-chat-fab:hover{transform:scale(1.08)}
.ai-chat-drawer{position:fixed;bottom:24px;right:24px;width:380px;height:540px;background:var(--bg-surface);border:1px solid rgba(167,139,250,.2);border-radius:var(--radius-lg);z-index:201;display:flex;flex-direction:column;box-shadow:0 16px 64px rgba(0,0,0,.5);animation:drawerIn .3s;overflow:hidden}
@keyframes drawerIn{from{opacity:0;transform:translateY(20px) scale(.95)}}
.chat-header{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(124,58,237,.08),transparent)}
.chat-header-title{font-size:14px;font-weight:600;flex:1}
.chat-header-close{background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;border-radius:6px}.chat-header-close:hover{color:var(--text-primary);background:var(--bg-hover)}
.chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.chat-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.6;animation:msgIn .25s}@keyframes msgIn{from{opacity:0;transform:translateY(6px)}}
.chat-msg.user{align-self:flex-end;background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;border-bottom-right-radius:4px}
.chat-msg.assistant{align-self:flex-start;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-secondary);border-bottom-left-radius:4px}
.chat-msg .ai-msg-label{font-size:10px;font-weight:600;color:var(--ai-glow);margin-bottom:4px;display:flex;align-items:center;gap:4px}
.chat-input-row{padding:12px 14px;border-top:1px solid var(--border);display:flex;gap:8px}
.chat-input{flex:1;background:var(--bg-elevated);border:1px solid var(--border);border-radius:20px;padding:8px 16px;color:var(--text-primary);font-size:13px;outline:none;font-family:var(--font-sans)}.chat-input:focus{border-color:var(--ai-glow)}
.chat-send{width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,#7C3AED,#A78BFA);color:#fff;display:flex;align-items:center;justify-content:center;transition:all .15s}.chat-send:hover{transform:scale(1.05)}.chat-send:disabled{opacity:.4;cursor:not-allowed;transform:none}
@keyframes fadeInUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeInUp .35s ease forwards}.delay-1{animation-delay:.04s;opacity:0}.delay-2{animation-delay:.08s;opacity:0}.delay-3{animation-delay:.12s;opacity:0}.delay-4{animation-delay:.16s;opacity:0}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}.shimmer-loading{background:linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-hover) 50%,var(--bg-elevated) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:var(--radius-sm)}
`;

// ═══════════ SETTINGS PAGE ═══════════
function SettingsPage({ config, setConfig }) {
  const [testStatus, setTestStatus] = useState(null); // null | "loading" | "success" | "error"
  const [testMsg, setTestMsg] = useState("");
  const [ollamaModels, setOllamaModels] = useState([]);
  const provider = AI_PROVIDERS[config.provider];

  // Fetch Ollama models when Ollama selected
  useEffect(() => {
    if (config.provider === "ollama") {
      fetch(`${config.ollamaUrl}/api/tags`).then(r => r.json()).then(data => {
        if (data.models) setOllamaModels(data.models.map(m => ({ id: m.name, name: m.name, desc: `${(m.size / 1e9).toFixed(1)}GB` })));
      }).catch(() => setOllamaModels([]));
    }
  }, [config.provider, config.ollamaUrl]);

  const testConnection = async () => {
    setTestStatus("loading"); setTestMsg("正在测试连接...");
    const result = await callAI(config, "You are a test assistant.", "Say 'connection successful' in Chinese, keep it under 10 words.", 100);
    if (result) { setTestStatus("success"); setTestMsg(`连接成功！回复: "${result.slice(0, 60)}"`); }
    else { setTestStatus("error"); setTestMsg("连接失败，请检查配置。"); }
  };

  const displayModels = config.provider === "ollama" && ollamaModels.length > 0 ? ollamaModels : provider.models;

  const typeLabel = { cloud: "商业云服务", local: "本地部署", "cloud-free": "免费云服务" };
  const typeColor = { cloud: "var(--accent-purple)", local: "var(--accent-green)", "cloud-free": "var(--accent-blue)" };

  return (
    <div className="settings-grid">
      {/* Provider List */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          选择 AI 服务商
        </div>
        <div className="provider-list">
          {Object.values(AI_PROVIDERS).map(p => (
            <div key={p.id} className={`provider-card ${config.provider === p.id ? 'active' : ''}`}
              onClick={() => {
                const defaultModel = p.models.find(m => m.default)?.id || p.models[0]?.id;
                setConfig(c => ({ ...c, provider: p.id, model: defaultModel, customModel: "", apiKey: p.id === config.provider ? c.apiKey : "" }));
                setTestStatus(null);
              }}>
              <div className="provider-radio" />
              <div className="provider-icon">{p.icon}</div>
              <div className="provider-info">
                <div className="provider-name">{p.name}</div>
                <div className="provider-type" style={{ color: typeColor[p.type] }}>{typeLabel[p.type]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config Panel */}
      <div className="config-section fade-in" key={config.provider}>
        <div className="config-section-header">
          <span style={{ fontSize: 24 }}>{provider.icon}</span>
          {provider.name} 配置
          <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 8px', borderRadius: 4, background: `${typeColor[provider.type]}18`, color: typeColor[provider.type], fontWeight: 600 }}>
            {typeLabel[provider.type]}
          </span>
        </div>
        <div className="config-section-body">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            {provider.description}
            {provider.signupUrl && (
              <span> — <a className="signup-link" href={provider.signupUrl} target="_blank" rel="noopener noreferrer">
                注册获取免费 API Key <Icons.ExternalLink />
              </a></span>
            )}
          </div>

          {/* Ollama URL */}
          {config.provider === "ollama" && (
            <div className="form-group">
              <div className="form-label">Ollama 服务地址</div>
              <input className="input-field" value={config.ollamaUrl}
                onChange={e => setConfig(c => ({ ...c, ollamaUrl: e.target.value }))}
                placeholder="http://localhost:11434" />
              <div className="form-hint">确保 Ollama 已启动且设置了 OLLAMA_ORIGINS=* 环境变量以允许跨域请求</div>
            </div>
          )}

          {/* API Key */}
          {provider.requiresKey && (
            <div className="form-group">
              <div className="form-label">API Key</div>
              <input className="input-field" type="password" value={config.apiKey}
                onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))}
                placeholder={provider.keyPlaceholder} />
              <div className="form-hint">密钥保存在浏览器本地存储中，刷新页面后自动恢复</div>
            </div>
          )}

          {/* Model Selection */}
          <div className="form-group">
            <div className="form-label">选择模型 {config.provider === "ollama" && ollamaModels.length > 0 &&
              <span style={{ fontSize: 10, color: 'var(--accent-green)' }}>（已检测到 {ollamaModels.length} 个本地模型）</span>}</div>
            <div className="model-grid">
              {displayModels.map(m => (
                <div key={m.id} className={`model-option ${config.model === m.id ? 'active' : ''}`}
                  onClick={() => setConfig(c => ({ ...c, model: m.id, customModel: "" }))}>
                  <div className="model-option-name">{m.name}</div>
                  <div className="model-option-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Model */}
          <div className="form-group">
            <div className="form-label">自定义模型名 <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>（可选，覆盖上方选择）</span></div>
            <input className="input-field" value={config.customModel}
              onChange={e => setConfig(c => ({ ...c, customModel: e.target.value }))}
              placeholder={config.provider === "ollama" ? "例如: qwen2.5:14b" : "例如: model-name"} />
          </div>

          {/* Temperature */}
          <div className="form-group">
            <div className="form-label">Temperature（创造性）</div>
            <div className="slider-row">
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>精确</span>
              <input type="range" min="0" max="1" step="0.1" value={config.temperature}
                onChange={e => setConfig(c => ({ ...c, temperature: parseFloat(e.target.value) }))} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>创意</span>
              <span className="slider-val">{config.temperature}</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="form-group">
            <div className="form-label">最大输出长度</div>
            <div className="slider-row">
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>简短</span>
              <input type="range" min="200" max="4000" step="200" value={config.maxTokens}
                onChange={e => setConfig(c => ({ ...c, maxTokens: parseInt(e.target.value) }))} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>详细</span>
              <span className="slider-val">{config.maxTokens}</span>
            </div>
          </div>

          {/* System Prompt Prefix */}
          <div className="form-group">
            <div className="form-label">系统提示词前缀 <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>（可选，添加到所有请求前）</span></div>
            <textarea className="input-field" rows={3} value={config.systemPromptPrefix}
              onChange={e => setConfig(c => ({ ...c, systemPromptPrefix: e.target.value }))}
              placeholder="例如: 请始终使用中文回答，使用学术风格。"
              style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
          </div>

          {/* Test Connection */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-ai" onClick={testConnection} disabled={testStatus === "loading"}>
              {testStatus === "loading" ? <Icons.Loader /> : <Icons.Sparkle />}
              测试连接
            </button>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              当前: <span style={{ color: 'var(--ai-glow)', fontWeight: 500 }}>{provider.name}</span>
              {" / "}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{config.customModel || config.model}</span>
            </div>
          </div>
          {testStatus && (
            <div className={`test-result ${testStatus === "success" ? "test-success" : testStatus === "error" ? "test-error" : "test-loading"}`}>
              {testStatus === "success" && <Icons.CheckCircle />}
              {testStatus === "error" && <Icons.AlertCircle />}
              {testStatus === "loading" && <Icons.Loader />}
              {testMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════ PAGE COMPONENTS (abbreviated, using config) ═══════════
function DashboardPage({ setActiveModule, config, currentTopic }) {
  const prov = AI_PROVIDERS[config.provider];
  const [stats, setStats] = useState({papers:0,clips:0,chats:0,checkPct:0,checkRemain:0});
  useEffect(()=>{
    Promise.all([getPapers(), getClips(), getChatHistory(), getChecklist()]).then(([papers, clips, chats, ck])=>{
      const p = papers?.length || PAPERS.length;
      const cl = clips?.length || 0;
      const ch = chats?.length || 0;
      const ckData = ck || CK_DATA;
      const td = ckData.reduce((s,c)=>s+c.items.filter(i=>i.done).length,0);
      const tt = ckData.reduce((s,c)=>s+c.items.length,0);
      setStats({papers:p, clips:cl, chats:ch, checkPct:tt?Math.round(td/tt*100):0, checkRemain:tt-td});
    });
  }, []);
  return (
    <div>
      <div className="dashboard-hero fade-in">
        <div className="hero-greeting">欢迎回来，研究者 <span style={{fontSize:22}}>👋</span></div>
        <div className="hero-subtitle">项目「{currentTopic?.name || "未命名课题"}」 — AI 引擎: {prov?.icon} {prov?.name}</div>
        <div style={{fontSize:12,color:'var(--text-muted)',marginTop:6}}>数据层当前为 IndexedDB；已预留文献导入导出接口，便于后续对接 SQLite/服务端数据库。</div>
      </div>
      <div className="stats-row">{[{label:"文献总量",value:String(stats.papers),change:"数据库存储",color:"var(--accent-blue)"},{label:"素材片段",value:String(stats.clips||84),change:"持久化",color:"var(--accent-green)"},{label:"AI 对话",value:String(stats.chats),change:"已保存",color:"var(--ai-glow)"},{label:"自查进度",value:`${stats.checkPct}%`,change:`${stats.checkRemain}项待检`,color:"var(--accent-orange)"}].map((s,i)=>(
        <div key={i} className={`stat-card fade-in delay-${i+1}`}><div className="stat-label"><span style={{color:s.color}}>●</span>{s.label}</div><div className="stat-value" style={{color:s.color}}>{s.value}</div><div className="stat-change">{s.change}</div></div>
      ))}</div>
      <div className="section-header"><div className="section-title">功能模块</div></div>
      <div className="module-grid">{MODULES.map((m,i)=>(
        <div key={m.id} className={`module-card fade-in delay-${(i%4)+1}`} onClick={()=>setActiveModule(m.id)}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:m.color}}/>
          <div className="module-icon-wrap" style={{background:`${m.color}18`,color:m.color}}><m.icon/></div>
          <div style={{display:'flex',alignItems:'center',gap:6}}><span className="module-label">{m.label}</span>{AI_MODS.includes(m.id)&&<AIBadge small/>}</div>
          <div className="module-label-en">{m.labelEn}</div>
        </div>
      ))}</div>
      <div className="section-header"><div className="section-title">最近文献</div><div className="section-action" onClick={()=>setActiveModule("knowledge")}>查看全部 <Icons.ArrowRight/></div></div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>{PAPERS.slice(0,3).map((p,i)=>(
        <div key={p.id} className={`paper-card fade-in delay-${i+1}`}><div className="paper-title">{p.title}</div><div className="paper-meta"><span className="paper-journal">{p.journal}</span><span>{p.authors}</span><span>{p.year}</span><span style={{color:'var(--accent-amber)'}}>✦ {p.cited}</span></div><div className="paper-tags">{p.tags.map(t=><span key={t} className="paper-tag">{t}</span>)}</div></div>
      ))}</div>
    </div>
  );
}

function TopicPage({ config }) {
  const [kw, setKw] = useState("锌空气电池催化剂");
  const [aiKw, setAiKw] = useState(null);
  const [ld, setLd] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");
  const defs = [{word:"zinc-air battery",type:"同义词"},{word:"Zn-air battery",type:"同义词"},{word:"metal-air battery",type:"近义词"},{word:"oxygen reduction reaction",type:"跨学科"},{word:"bifunctional catalyst",type:"相关表达"}];
  const expand = async()=>{if(!kw.trim())return;setLd(true);setAiKw(null);const r=await callAIJSON(config,'你是学术关键词扩展助手。返回纯JSON:{"keywords":[{"word":"...","type":"同义词|近义词|跨学科|相关表达","reason":"..."}]}。8-12个英文关键词。',`扩展:"${kw}"`);setLd(false);if(r?.keywords)setAiKw(r.keywords);};
  const runSearch = async () => {
    setSearching(true);
    setSearchMsg("");
    const query = encodeURIComponent(kw || "zinc-air battery catalyst");
    [
      `https://www.scopus.com/results/results.uri?query=${query}`,
      `https://www.webofscience.com/wos/woscc/basic-search?query=${query}`,
      `https://kns.cnki.net/kns8s/basic?kw=${query}`,
    ].forEach((url) => window.open(url, "_blank", "noopener"));
    await new Promise((r) => setTimeout(r, 600));
    setSearching(false);
    setSearchMsg("已在新标签页打开 Scopus / WoS / CNKI 检索页面。");
  };
  const kws=aiKw||defs;const cc=t=>t==="同义词"?"chip-synonym":t==="跨学科"?"chip-cross":t==="近义词"?"chip-related":"chip-ai";
  return(
    <div className="topic-layout">
      <div><div className="panel fade-in"><div className="panel-header"><Icons.Search/>关键词扩展器<AIBadge/></div><div className="panel-body">
        <div style={{display:'flex',gap:8,marginBottom:16}}><input className="input-field" value={kw} onChange={e=>setKw(e.target.value)} placeholder="输入核心关键词..." onKeyDown={e=>e.key==='Enter'&&expand()}/><button className="btn btn-ai" onClick={expand} disabled={ld}><Icons.Sparkle/>{ld?'分析中...':'AI 扩展'}</button></div>
        {ld&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{[1,2,3].map(i=><div key={i} className="shimmer-loading" style={{height:32,width:`${70+i*8}%`}}/>)}</div>}
        {!ld&&<div className="keyword-chips">{kws.map((k,i)=>(<div key={i} className={`keyword-chip ${cc(k.type)}`} title={k.reason||k.type}><span>{k.word}</span><span className="chip-freq">{k.type}</span></div>))}</div>}
        {aiKw&&<div className="ai-summary-panel" style={{marginTop:14}}><div className="ai-summary-header"><Icons.Sparkle/>AI 扩展完成</div><div className="ai-summary-text">已扩展 {aiKw.length} 个学术关键词。</div></div>}
      </div></div></div>
      <div><div className="panel fade-in delay-1"><div className="panel-header"><Icons.Globe/>检索式构建器</div><div className="panel-body">
        <div className="search-formula">(<span className="formula-term">"zinc-air battery"</span> <span className="formula-op">OR</span> <span className="formula-term">"Zn-air battery"</span>)<br/><span className="formula-op">AND</span><br/>(<span className="formula-term">"catalyst"</span> <span className="formula-op">OR</span> <span className="formula-term">"electrocatalyst"</span>)<br/><span className="formula-op">AND</span><br/>(<span className="formula-term">"oxygen reduction"</span> <span className="formula-op">OR</span> <span className="formula-term">"oxygen evolution"</span>)</div>
        <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:10}}>预估检索结果：</div>
        <div className="db-results"><div className="db-badge">Scopus <span className="db-count">2,847</span></div><div className="db-badge">WoS <span className="db-count">2,103</span></div><div className="db-badge">CNKI <span className="db-count">891</span></div></div>
        <div style={{marginTop:14,display:'flex',gap:8}}><button className="btn btn-primary btn-sm" onClick={runSearch} disabled={searching}>{searching?'检索中...':'执行检索'}</button><button className="btn btn-secondary btn-sm">保存</button></div>
        {searchMsg && <div style={{marginTop:10,fontSize:12,color:'var(--accent-green)'}}>{searchMsg}</div>}
      </div></div></div>
    </div>);
}

function reorderList(list, fromIndex, toIndex) {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function useDragReorder(onReorder) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const startDrag = (index) => (e) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };
  const dragOver = (e) => e.preventDefault();
  const dropAt = (targetIndex) => (e) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDraggingIndex(null);
      return;
    }
    onReorder(sourceIndex, targetIndex);
    setDraggingIndex(null);
  };
  const endDrag = () => setDraggingIndex(null);
  return { draggingIndex, startDrag, dragOver, dropAt, endDrag };
}

function KnowledgePage({ config }) {
  const DEFAULT_GROUPS = ["核心文献", "综述文献", "高被引", "拓展阅读", "导入文献"];
  const [grp, setGrp] = useState("全部");const [sel, setSel] = useState(null);const [sum, setSum] = useState("");const [sL, setSL] = useState(false);
  const [papers, setPapers] = useState(PAPERS);
  const [newPaper, setNewPaper] = useState(false);
  const [groupInput, setGroupInput] = useState("");
  const [groupOrder, setGroupOrder] = useState(DEFAULT_GROUPS);
  const [np, setNp] = useState({ title: "", authors: "", journal: "", year: 2024, tags: "", group: "核心文献" });
  const importRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [paperData, groupState] = await Promise.all([getPapers(), getUIState("knowledge_groups")]);
      if (paperData) {
        setPapers(paperData);
      } else {
        await savePapers(PAPERS.map((p, i) => ({ ...p, id: i + 1 })));
      }
      if (groupState?.order?.length) {
        setGroupOrder(groupState.order);
      } else if (groupState?.groups?.length) {
        setGroupOrder([...DEFAULT_GROUPS, ...groupState.groups.filter((g) => !DEFAULT_GROUPS.includes(g))]);
      }
    })();
  }, []);

  useEffect(() => {
    saveUIState("knowledge_groups", { order: groupOrder });
  }, [groupOrder]);

  const handleAddPaper = async () => {
    if (!np.title.trim()) return;
    const paper = { ...np, tags: np.tags.split(",").map(t => t.trim()).filter(Boolean), cited: 0 };
    const id = await addPaper(paper);
    setPapers(prev => [...prev, { ...paper, id }]);
    setNp({ title: "", authors: "", journal: "", year: 2024, tags: "", group: "核心文献" });
    setNewPaper(false);
  };

  const handleDeletePaper = async (id) => {
    await deletePaper(id);
    setPapers(prev => prev.filter(p => p.id !== id));
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    const imported = file.name.toLowerCase().endsWith('.ris') ? parseRIS(content) : parseBibTeX(content);
    for (const paper of imported) {
      const id = await addPaper(paper);
      setPapers(prev => [...prev, { ...paper, id }]);
    }
    e.target.value = '';
  };

  const exportRIS = () => {
    const blob = new Blob([papersToRIS(papers)], { type: 'application/x-research-info-systems' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sciflow-export.ris';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const discoveredGroups = [...new Set([...DEFAULT_GROUPS, ...groupOrder, ...papers.map(p => p.group).filter(Boolean)])];
  const groupNames = [
    ...groupOrder.filter((g) => discoveredGroups.includes(g)),
    ...discoveredGroups.filter((g) => !groupOrder.includes(g)),
  ];
  const groups = [{ name: "全部", count: papers.length }, ...groupNames.map((g, index) => ({ name: g, index, count: papers.filter(p => p.group === g).length }))];
  const customGroupDrag = useDragReorder((fromIndex, toIndex) => {
    setGroupOrder(prev => reorderList(prev.filter((g) => groupNames.includes(g)), fromIndex, toIndex));
  });
  const addGroup = () => {
    const name = groupInput.trim();
    if (!name || groupNames.includes(name)) return;
    setGroupOrder(prev => [...prev, name]);
    setGroupInput("");
  };
  const deleteGroupByName = async (name) => {
    if (!name || DEFAULT_GROUPS.includes(name)) return;
    const nextPapers = papers.map(p => p.group === name ? { ...p, group: "未分组" } : p);
    setPapers(nextPapers);
    await savePapers(nextPapers);
    setGroupOrder(prev => prev.filter(g => g !== name));
    if (grp === name) setGrp("全部");
  };
  const filt=grp==="全部"?papers:papers.filter(p=>p.group===grp);
  const doSum=async(p)=>{setSel(p);setSum("");setSL(true);const r=await callAI(config,'你是材料科学资深研究员。简析论文:1)核心问题 2)方法创新 3)结论 4)对锌空气电池课题参考价值。中文≤150字。',`标题:${p.title}
作者:${p.authors}
期刊:${p.journal}(${p.year})`,500);setSL(false);setSum(r||"AI不可用");};
  return(
    <div className="kb-layout">
      <div className="kb-sidebar fade-in"><div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:1.5}}>文献分组</div>
        {groups.map((g) => {
          const dragIndex = groupNames.indexOf(g.name);
          return <div key={g.name} className={`group-item ${grp===g.name?'active':''} ${customGroupDrag.draggingIndex===dragIndex?'dragging':''}`} onClick={()=>setGrp(g.name)} draggable={g.name!=="全部"} onDragStart={g.name!=="全部"?customGroupDrag.startDrag(dragIndex):undefined} onDragOver={g.name!=="全部"?customGroupDrag.dragOver:undefined} onDrop={g.name!=="全部"?customGroupDrag.dropAt(dragIndex):undefined} onDragEnd={g.name!=="全部"?customGroupDrag.endDrag:undefined}><span className="drag-handle" title="拖拽排序">⋮⋮</span><Icons.Folder/>{g.name}<span className="group-count">{g.count}</span>{g.name!=="全部"&&!DEFAULT_GROUPS.includes(g.name)&&<button className="btn btn-secondary btn-sm" style={{padding:'2px 6px',marginLeft:6,color:'var(--accent-pink)'}} onClick={(e)=>{e.stopPropagation();deleteGroupByName(g.name);}}>删</button>}</div>;
        })}
        <div style={{display:'flex',gap:6,marginTop:8}}><input className="input-field" placeholder="新增分组" value={groupInput} onChange={e=>setGroupInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addGroup()}/><button className="btn btn-secondary btn-sm" onClick={addGroup}><Icons.Plus/></button></div>
        <button className="btn btn-primary btn-sm" style={{marginTop:12,width:'100%'}} onClick={()=>setNewPaper(true)}><Icons.Plus/>添加文献</button>
        <button className="btn btn-secondary btn-sm" style={{marginTop:8,width:'100%'}} onClick={()=>importRef.current?.click()}>导入 RIS/BibTeX</button>
        <button className="btn btn-secondary btn-sm" style={{marginTop:8,width:'100%'}} onClick={exportRIS}>导出 RIS</button>
        <input ref={importRef} type="file" accept=".ris,.bib,.bibtex" style={{display:'none'}} onChange={handleImport}/>
      </div>
      <div className="fade-in delay-1" style={{display:'flex',flexDirection:'column',gap:8,overflow:'auto'}}>
        {newPaper && (
          <div className="paper-card" style={{border:'1px solid var(--accent-amber)'}}>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <input className="input-field" placeholder="论文标题..." value={np.title} onChange={e=>setNp(p=>({...p,title:e.target.value}))}/>
              <div style={{display:'flex',gap:8}}><input className="input-field" placeholder="作者..." value={np.authors} onChange={e=>setNp(p=>({...p,authors:e.target.value}))}/><input className="input-field" placeholder="期刊..." value={np.journal} onChange={e=>setNp(p=>({...p,journal:e.target.value}))}/></div>
              <div style={{display:'flex',gap:8}}><input className="input-field" type="number" placeholder="年份" value={np.year} onChange={e=>setNp(p=>({...p,year:parseInt(e.target.value)||2024}))}/><input className="input-field" placeholder="标签(逗号分隔)..." value={np.tags} onChange={e=>setNp(p=>({...p,tags:e.target.value}))}/><select className="input-field" value={np.group} onChange={e=>setNp(p=>({...p,group:e.target.value}))} style={{maxWidth:140}}>{groupNames.map(g=><option key={g} value={g}>{g}</option>)}</select></div>
              <div style={{display:'flex',gap:8}}><button className="btn btn-primary btn-sm" onClick={handleAddPaper}>保存</button><button className="btn btn-secondary btn-sm" onClick={()=>setNewPaper(false)}>取消</button></div>
            </div>
          </div>
        )}
        {filt.map(p=><div key={p.id} className="paper-card"><div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}><div style={{flex:1}}><div className="paper-title">{p.title}</div><div className="paper-meta"><span className="paper-journal">{p.journal}</span><span>{p.authors}</span><span>{p.year}</span><span style={{color:'var(--accent-amber)'}}>✦{p.cited}</span></div><div className="paper-tags">{(p.tags||[]).map(t=><span key={t} className="paper-tag">{t}</span>)}</div></div><div style={{display:'flex',gap:6,flexShrink:0,marginLeft:10}}><button className="btn btn-ai btn-sm" onClick={()=>doSum(p)}><Icons.Sparkle/>AI分析</button><button className="btn btn-secondary btn-sm" onClick={()=>handleDeletePaper(p.id)} style={{color:'var(--accent-pink)'}}>删除</button></div></div>
          {sel?.id===p.id&&<div className="ai-summary-panel"><div className="ai-summary-header"><Icons.Sparkle/>AI文献分析</div>{sL?<TypingDots/>:<div className="ai-summary-text">{sum}</div>}</div>}
        </div>)}
      </div>
    </div>);
}

function ExperimentPage({ config }) {
  const [di, setDi] = useState("");const [dr, setDr] = useState("");const [dL, setDL] = useState(false);
  const [nodes, setNodes] = useState([{id:1,level:1,label:"研究意义",text:"开发高效低成本锌空气电池催化剂",color:"var(--accent-amber)"},{id:2,level:1,label:"关键问题",text:"如何提升 Co₃O₄ 的 OER/ORR 双功能性能？",color:"var(--accent-amber)"},{id:3,level:2,label:"子问题 1",text:"形貌调控对催化活性的影响",refs:"Zhang 2024",color:"var(--accent-blue)"},{id:4,level:2,label:"子问题 2",text:"N 掺杂优化电子结构",refs:"Chen 2023",color:"var(--accent-blue)"},{id:5,level:3,label:"实验变量",text:"合成温度、前驱体浓度、N源",color:"var(--accent-green)"},{id:6,level:3,label:"表征",text:"XRD, SEM, TEM, XPS",color:"var(--accent-green)"}]);
  const diag=async()=>{if(!di.trim())return;setDL(true);setDr("");const r=await callAI(config,'你是材料科学实验导师。分析实验异常:1)2-3个原因 2)排查路径 3)解决建议。中文≤200字。',di,600);setDL(false);setDr(r||"AI不可用");};
  const updateNode = (id, key, value) => setNodes(prev => prev.map(n => n.id===id?{...n,[key]:value}:n));
  const addNode = () => setNodes(prev => [...prev, {id:Date.now(), level:2, label:'新节点', text:'可编辑内容', refs:'', color:'var(--accent-blue)'}]);
  const deleteNode = (id) => setNodes(prev => prev.filter(n => n.id !== id));
  return(
    <div>
      <div className="panel fade-in" style={{marginBottom:16}}><div className="panel-header"><Icons.Wand/>AI 问题诊断器<AIBadge/></div><div className="panel-body">
        <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:10}}>描述实验异常，AI 分析原因并推荐排查路径</div>
        <div style={{display:'flex',gap:8}}><input className="input-field" value={di} onChange={e=>setDi(e.target.value)} placeholder="例如：LSV电流不稳定..." onKeyDown={e=>e.key==='Enter'&&diag()}/><button className="btn btn-ai" onClick={diag} disabled={dL||!di.trim()}><Icons.Sparkle/>{dL?'分析...':'诊断'}</button></div>
        {dL&&<div style={{marginTop:10}}><TypingDots/></div>}
        {dr&&!dL&&<div className="ai-summary-panel" style={{marginTop:10}}><div className="ai-summary-header"><Icons.Sparkle/>诊断结果</div><div className="ai-summary-text">{dr}</div></div>}
      </div></div>
      <div className="section-header"><div className="section-title">问题分解树</div><button className="btn btn-secondary btn-sm" onClick={addNode}><Icons.Plus/>新增节点</button></div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>{nodes.map((n,i)=><div key={n.id} className={`tree-node tree-level-${n.level} fade-in delay-${(i%4)+1}`}><div style={{display:'flex',gap:8,alignItems:'center'}}><input className="input-field" style={{marginBottom:6,maxWidth:220,color:n.color,fontWeight:600}} value={n.label} onChange={e=>updateNode(n.id,'label',e.target.value)}/><button className="btn btn-secondary btn-sm" style={{marginBottom:6,color:'var(--accent-pink)'}} onClick={()=>deleteNode(n.id)}>删除</button></div><textarea className="input-field" rows={2} value={n.text} onChange={e=>updateNode(n.id,'text',e.target.value)} style={{resize:'vertical'}}/>{n.refs!==undefined&&<input className="input-field" style={{marginTop:6}} placeholder="关联文献" value={n.refs||''} onChange={e=>updateNode(n.id,'refs',e.target.value)}/>}</div>)}</div>
    </div>);
}

function WritingPage({ config }) {
  const [sec, setSec] = useState("intro");
  const defaultText = `锌空气电池因其理论能量密度高、成本低廉、环境友好等优点，被认为是下一代可持续能源存储技术的有力候选方案。

近年来，过渡金属氧化物成为替代贵金属催化剂的研究热点。

尽管已有大量研究，但对其构效关系的理解仍不够深入。`;
  const [text, setText] = useState(defaultText);
  const defaultOutline = [{id:"abstract",label:"摘要"},{id:"intro",label:"1. 引言"},{id:"intro-bg",label:"1.1 背景",sub:true},{id:"methods",label:"2. 实验方法"},{id:"results",label:"3. 结果讨论"},{id:"conclusion",label:"4. 结论"}];
  const [outline, setOutline] = useState(defaultOutline);
  const [newSectionName, setNewSectionName] = useState("");

  useEffect(() => {
    (async () => {
      const [drafts, outlineState] = await Promise.all([getDrafts(), getUIState("writing_outline")]);
      const found = drafts.find(x => x.id === sec);
      if (found) setText(found.content);
      if (outlineState?.items?.length) setOutline(outlineState.items);
    })();
  }, [sec]);
  const saveText = useCallback((val) => { setText(val); saveDraft({ id: sec, content: val, updatedAt: Date.now() }); }, [sec]);
  useEffect(() => {
    saveUIState("writing_outline", { items: outline });
  }, [outline]);
  const outlineDrag = useDragReorder((fromIndex, toIndex) => setOutline(prev => reorderList(prev, fromIndex, toIndex)));
  const [sug, setSug] = useState([]);const [aL, setAL] = useState(false);const [aq, setAq] = useState("");
  const analyze=async()=>{setAL(true);setSug([]);const r=await callAIJSON(config,'学术写作教授。分析论文段落。返回JSON:{"suggestions":[{"type":"观点检查|逻辑分析|语言润色|引用建议","content":"...","priority":"high|medium|low"}]}。3-4条。',`引言:
${text}`,800);setAL(false);if(r?.suggestions)setSug(r.suggestions);};
  const ask=async()=>{if(!aq.trim())return;const q=aq;setAq("");setAL(true);const r=await callAI(config,'锌空气电池论文写作助手。中文≤150字。',`段落:
${text}

问题:${q}`,500);setAL(false);if(r)setSug(p=>[...p,{type:"AI 回答",content:r,priority:"high"}]);};
  const pc={high:'var(--accent-orange)',medium:'var(--accent-amber)',low:'var(--accent-blue)'};
  const editSuggestion = (i, val) => setSug(prev => prev.map((s,idx)=>idx===i?{...s, content:val}:s));
  const addSection = () => {
    const label = newSectionName.trim();
    if (!label) return;
    const id = `section-${Date.now()}`;
    setOutline(prev => [...prev, { id, label }]);
    setSec(id);
    saveDraft({ id, content: "", updatedAt: Date.now() });
    setNewSectionName("");
  };
  const updateSectionLabel = (id, label) => setOutline(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  const deleteSection = (id) => {
    setOutline(prev => prev.filter(s => s.id !== id));
    if (sec === id) setSec("intro");
  };
  const currentSectionLabel = outline.find(o => o.id === sec)?.label || "正文";
  return(
    <div className="writing-layout">
      <div className="writing-outline fade-in"><div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:1.5}}>大纲</div>{outline.map((o,index)=><div key={o.id} className={`outline-item ${o.sub?'outline-sub':''} ${sec===o.id?'active':''} ${outlineDrag.draggingIndex===index?'dragging':''}`} onClick={()=>setSec(o.id)} draggable onDragStart={outlineDrag.startDrag(index)} onDragOver={outlineDrag.dragOver} onDrop={outlineDrag.dropAt(index)} onDragEnd={outlineDrag.endDrag}><span className="drag-handle" title="拖拽排序">⋮⋮</span>{!o.sub&&<Icons.ChevronRight/>}<span style={{flex:1}}>{o.label}</span><button className="btn btn-secondary btn-sm" style={{padding:'1px 6px'}} onClick={(e)=>{e.stopPropagation();deleteSection(o.id);}}>删</button></div>)}<div style={{display:'flex',gap:6,marginTop:8}}><input className="input-field" placeholder="新增章节" value={newSectionName} onChange={e=>setNewSectionName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSection()}/><button className="btn btn-secondary btn-sm" onClick={addSection}><Icons.Plus/></button></div></div>
      <div className="writing-editor fade-in delay-1"><div className="editor-toolbar">{"B,I,H2,引用".split(',').map(b=><button key={b} className="tool-btn">{b}</button>)}<div style={{marginLeft:'auto'}}><button className="tool-btn ai-tool" onClick={analyze} disabled={aL}><Icons.Sparkle/>AI 分析</button></div></div><div style={{flex:1,padding:'20px',overflow:'auto'}}><input className="input-field" value={currentSectionLabel} onChange={e=>updateSectionLabel(sec,e.target.value)} style={{fontFamily:'var(--font-serif)',fontSize:20,fontWeight:700,marginBottom:14,maxWidth:360}}/><textarea className="editor-textarea" value={text} onChange={e=>saveText(e.target.value)} style={{minHeight:260}}/></div></div>
      <div className="writing-ai-panel fade-in delay-2"><div className="ai-panel-header"><Icons.Sparkle/>AI 写作助手<AIBadge/></div><div className="ai-panel-body">
        {sug.length===0&&!aL&&<div style={{textAlign:'center',padding:'32px 16px',color:'var(--text-muted)',fontSize:13}}><div style={{fontSize:28,marginBottom:10,opacity:.4}}>✨</div>点击「AI 分析」获取建议</div>}
        {aL&&<div className="ai-suggestion"><div className="ai-suggestion-label"><Icons.Sparkle/>分析中...</div><TypingDots/></div>}
        {sug.map((s,i)=><div key={i} className="ai-suggestion"><div className="ai-suggestion-label"><span style={{width:6,height:6,borderRadius:'50%',background:pc[s.priority]||'var(--ai-glow)'}}/>{s.type}<button className="btn btn-secondary btn-sm" style={{marginLeft:'auto',padding:'2px 8px'}} onClick={()=>setSug(prev=>prev.filter((_,idx)=>idx!==i))}>删除</button></div><textarea className="input-field" rows={3} value={s.content} onChange={e=>editSuggestion(i,e.target.value)} style={{marginTop:6,resize:'vertical'}}/></div>)}
      </div><div className="ai-panel-input"><input value={aq} onChange={e=>setAq(e.target.value)} placeholder="问AI..." onKeyDown={e=>e.key==='Enter'&&ask()}/><button className="btn btn-ai btn-sm" onClick={ask} disabled={!aq.trim()||aL}><Icons.Send/></button></div></div>
    </div>);
}

function ReadingPage(){
  const [pdfName, setPdfName] = useState('');
  const [clipText, setClipText] = useState('');
  const [msg, setMsg] = useState('');
  const [clips, setClips] = useState([{f:"前言素材",c:23,i:"📝"},{f:"实验方法",c:15,i:"🧪"},{f:"结果讨论",c:31,i:"📊"},{f:"图片素材",c:42,i:"🖼"}]);

  useEffect(() => {
    (async () => {
      const savedClips = await getClips();
      if (savedClips?.length) {
        setClips(savedClips.map(({ f, c, i }) => ({ f, c, i })));
      }
    })();
  }, []);

  const importPdf = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfName(file.name);
    setMsg('已加载 PDF 文件（当前版本提供手动摘录，自动结构化提取后续接入）。');
  };
  const addManualClip = async () => {
    if (!clipText.trim()) return;
    const clip = {f:'手动摘录', c:clipText.length, i:'✂️'};
    const id = await addClip(clip);
    setClips(prev => [{...clip, id}, ...prev]);
    setClipText('');
    setMsg('素材已加入素材库。');
  };
  return(<div className="panel fade-in"><div className="panel-header"><Icons.Book/>PDF 阅读器 & 素材截取</div><div className="panel-body"><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}><div style={{background:'var(--bg-deep)',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)',padding:24,minHeight:260,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}><div style={{fontSize:48,opacity:.3}}>📄</div><div style={{color:'var(--text-muted)',fontSize:14,textAlign:'center'}}>{pdfName?`已选择: ${pdfName}`:'拖入 PDF 开始阅读'}</div><label className="btn btn-secondary" style={{marginTop:6,cursor:'pointer'}}>选择文件<input type="file" accept="application/pdf" style={{display:'none'}} onChange={importPdf}/></label><textarea className="input-field" rows={4} placeholder="粘贴从 PDF 中摘录的素材..." value={clipText} onChange={e=>setClipText(e.target.value)} style={{width:'100%',marginTop:8,resize:'vertical'}}/><button className="btn btn-primary btn-sm" onClick={addManualClip}>提取到素材库</button>{msg&&<div style={{fontSize:12,color:'var(--accent-green)',textAlign:'center'}}>{msg}</div>}</div><div><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>素材库</div><div style={{display:'flex',flexDirection:'column',gap:6}}>{clips.map((x,i)=><div key={i} style={{padding:'11px 14px',background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:16}}>{x.i}</span><span style={{fontSize:13,fontWeight:500,flex:1}}>{x.f}</span><span style={{fontSize:12,fontFamily:'var(--font-mono)',color:'var(--text-muted)'}}>{x.c}</span></div>)}</div></div></div></div></div>);
}

function ChecklistPage(){const[data,setData]=useState(CK_DATA);
  useEffect(()=>{getChecklist().then(d=>{if(d)setData(d);else saveChecklist(CK_DATA);});}, []);
  const toggle=(ci,ii)=>{const nd=data.map((c,i)=>i===ci?{...c,items:c.items.map((it,j)=>j===ii?{...it,done:!it.done}:it)}:c);setData(nd);saveChecklist(nd);};
  const td=data.reduce((s,c)=>s+c.items.filter(i=>i.done).length,0);const tt=data.reduce((s,c)=>s+c.items.length,0);const pct=Math.round(td/tt*100);
  return(<div><div className="panel fade-in" style={{marginBottom:18}}><div className="panel-body" style={{display:'flex',alignItems:'center',gap:18}}><div><div style={{fontSize:12,color:'var(--text-muted)',marginBottom:3}}>总体进度</div><div style={{fontSize:32,fontWeight:700,fontFamily:'var(--font-mono)',color:pct>=75?'var(--accent-green)':'var(--accent-orange)'}}>{pct}%</div></div><div style={{flex:1,height:8,background:'var(--bg-deep)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,var(--accent-green),var(--accent-teal))',borderRadius:4,transition:'width .4s'}}/></div><div style={{fontSize:13,fontFamily:'var(--font-mono)',color:'var(--text-secondary)'}}>{td}/{tt}</div></div></div>
    <div className="checklist-grid">{data.map((cat,ci)=>{const d=cat.items.filter(i=>i.done).length;return(<div key={ci} className={`checklist-category fade-in delay-${ci+1}`}><div className="checklist-cat-header">{cat.category}<span className="checklist-progress">{d}/{cat.items.length}</span></div><div className="checklist-items">{cat.items.map((it,ii)=><div key={ii} className="checklist-item" onClick={()=>toggle(ci,ii)}><div className={`checkbox ${it.done?'checked':''}`}>{it.done&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}</div><span className={`item-text ${it.done?'checked':''}`}>{it.text}</span></div>)}</div></div>);})}</div></div>);}

function LabLogPage(){
  const defaultEntries=[{id:1,time:"2024-03-06 14:30",title:"Co₃O₄ 水热合成 #3",desc:"0.05M Co(NO₃)₂+0.1M尿素，120°C/12h",sample:"ZAB-20240306-03"},{id:2,time:"2024-03-06 10:15",title:"XRD 表征 #1&#2",desc:"10-80°，批次#2在36.8°峰强增强",sample:"ZAB-20240304-01"},{id:3,time:"2024-03-05 16:45",title:"LSV 电化学测试",desc:"三电极，过电位 #1=382mV, #2=341mV",sample:"ZAB-20240304-02"},{id:4,time:"2024-03-05 09:00",title:"⚠ 重复性排查",desc:"电极夹具接触不良→更换后恢复",sample:""}];
  const [entries, setEntries] = useState(defaultEntries);
  const [showNew, setShowNew] = useState(false);
  const [nl, setNl] = useState({ title: "", desc: "", sample: "" });

  useEffect(()=>{getLogs().then(d=>{if(d)setEntries(d);else saveLogs(defaultEntries);});}, []);

  const handleAdd = async () => {
    if (!nl.title.trim()) return;
    const entry = { ...nl, time: new Date().toLocaleString("zh-CN", { hour12: false }) };
    const id = await addLog(entry);
    setEntries(prev => [{ ...entry, id }, ...prev]);
    setNl({ title: "", desc: "", sample: "" });
    setShowNew(false);
  };

  const genSampleId = () => {
    const d = new Date();
    const ds = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const seq = String(entries.length + 1).padStart(2, '0');
    return `ZAB-${ds}-${seq}`;
  };

  return(<div>
    <div style={{display:'flex',gap:8,marginBottom:18}}><button className="btn btn-primary" onClick={()=>setShowNew(true)}><Icons.Plus/>新建记录</button><button className="btn btn-secondary" onClick={()=>setNl(p=>({...p,sample:genSampleId()}))}>生成编号</button></div>
    {showNew && (
      <div className="log-entry fade-in" style={{marginBottom:14,marginLeft:0,border:'1px solid var(--accent-teal)'}}>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <input className="input-field" placeholder="实验标题..." value={nl.title} onChange={e=>setNl(p=>({...p,title:e.target.value}))}/>
          <textarea className="input-field" rows={2} placeholder="实验描述..." value={nl.desc} onChange={e=>setNl(p=>({...p,desc:e.target.value}))} style={{resize:'vertical'}}/>
          <div style={{display:'flex',gap:8,alignItems:'center'}}><input className="input-field" placeholder="样品编号" value={nl.sample} onChange={e=>setNl(p=>({...p,sample:e.target.value}))}/><button className="btn btn-secondary btn-sm" onClick={()=>setNl(p=>({...p,sample:genSampleId()}))}>自动编号</button></div>
          <div style={{display:'flex',gap:8}}><button className="btn btn-primary btn-sm" onClick={handleAdd}>保存</button><button className="btn btn-secondary btn-sm" onClick={()=>setShowNew(false)}>取消</button></div>
        </div>
      </div>
    )}
    <div className="log-timeline">{entries.map((e,i)=><div key={e.id||i} className={`log-entry fade-in delay-${Math.min(i+1,4)}`}><div className="log-dot"/><div className="log-time">{e.time}</div><div className="log-title">{e.title}</div><div className="log-desc">{e.desc}</div>{e.sample&&<div className="log-sample">🏷{e.sample}</div>}</div>)}</div>
  </div>);}

// ═══════════ AI CHAT ═══════════
function AIChatDrawer({ config }) {
  const [open, setOpen] = useState(false);
  const defaultMsg = [{role:"assistant",content:"你好！我是 SciFlow AI 助手 🔬\n可以问我任何科研问题。"}];
  const [msgs, setMsgs] = useState(defaultMsg);
  const [inp, setInp] = useState("");const [ld, setLd] = useState(false);const end=useRef(null);
  useEffect(()=>{getChatHistory().then(d=>{if(d&&d.length>0)setMsgs(d.map(({role,content})=>({role,content})));});}, []);
  useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth'});},[msgs]);
  const send=async()=>{if(!inp.trim()||ld)return;const m=inp.trim();setInp("");
    const userMsg={role:"user",content:m};setMsgs(p=>[...p,userMsg]);saveChatMessage(userMsg);setLd(true);
    const hist=[...msgs,userMsg].map(x=>({role:x.role==="assistant"?"assistant":"user",content:x.content}));
    const r=await callAIChat(config,'你是SciFlow AI科研助手。专长：材料科学、电化学、论文写作。中文≤200字。',hist);
    const aiMsg={role:"assistant",content:r||"暂时无法回答。"};setMsgs(p=>[...p,aiMsg]);saveChatMessage(aiMsg);setLd(false);};
  const handleClear=async()=>{await clearChatHistory();setMsgs(defaultMsg);};
  const prov=AI_PROVIDERS[config.provider];
  if(!open)return<button className="ai-chat-fab" onClick={()=>setOpen(true)} title="AI 助手"><Icons.Bot/></button>;
  return(
    <div className="ai-chat-drawer">
      <div className="chat-header"><div style={{color:'var(--ai-glow)'}}><Icons.Bot/></div><div className="chat-header-title">SciFlow AI</div><span style={{fontSize:12,color:'var(--text-muted)'}}>{prov?.icon}</span><AIBadge small/><button className="chat-header-close" onClick={handleClear} title="清空聊天" style={{marginRight:4,fontSize:11,color:'var(--text-muted)'}}>清空</button><button className="chat-header-close" onClick={()=>setOpen(false)}><Icons.Close/></button></div>
      <div className="chat-messages">{msgs.map((m,i)=><div key={i} className={`chat-msg ${m.role}`}>{m.role==='assistant'&&<div className="ai-msg-label"><Icons.Sparkle/>AI</div>}<div style={{whiteSpace:'pre-wrap'}}>{m.content}</div></div>)}{ld&&<div className="chat-msg assistant"><div className="ai-msg-label"><Icons.Sparkle/>AI</div><TypingDots/></div>}<div ref={end}/></div>
      <div className="chat-input-row"><input className="chat-input" value={inp} onChange={e=>setInp(e.target.value)} placeholder="输入问题..." onKeyDown={e=>e.key==='Enter'&&send()}/><button className="chat-send" onClick={send} disabled={!inp.trim()||ld}><Icons.Send/></button></div>
    </div>);
}

// ═══════════ MAIN APP ═══════════
export default function SciFlowApp() {
  const [activeModule, setActiveModule] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState(() => loadConfig(DEFAULT_CONFIG));
  const [topics, setTopics] = useState(DEFAULT_TOPICS);
  const [topicName, setTopicName] = useState("");
  const [activeTopicId, setActiveTopicId] = useState(DEFAULT_TOPICS[0].id);

  // Persist AI config to localStorage whenever it changes
  useEffect(() => { saveConfig(config); }, [config]);

  useEffect(() => {
    (async () => {
      const topicState = await getUIState("topics_state");
      if (topicState?.topics?.length) {
        setTopics(topicState.topics);
        if (topicState.activeTopicId && topicState.topics.find((t) => t.id === topicState.activeTopicId)) {
          setActiveTopicId(topicState.activeTopicId);
        } else {
          setActiveTopicId(topicState.topics[0].id);
        }
      }

      const navState = await getUIState("navigation_state");
      if (navState?.activeModule) {
        setActiveModule(navState.activeModule);
      }
    })();
  }, []);

  useEffect(() => {
    if (!topics.length) return;
    saveUIState("topics_state", { topics, activeTopicId });
  }, [topics, activeTopicId]);

  useEffect(() => {
    saveUIState("navigation_state", { activeModule });
  }, [activeModule]);

  const mod = MODULES.find(m => m.id === activeModule);
  const title = activeModule === "home" ? "概览" : activeModule === "settings" ? "AI 配置" : mod?.label || "";

  const render = () => {
    switch (activeModule) {
      case "home": return <DashboardPage setActiveModule={setActiveModule} config={config} currentTopic={currentTopic} />;
      case "settings": return <SettingsPage config={config} setConfig={setConfig} />;
      case "topic": return <TopicPage config={config} />;
      case "knowledge": return <KnowledgePage config={config} />;
      case "reading": return <ReadingPage />;
      case "experiment": return <ExperimentPage config={config} />;
      case "writing": return <WritingPage config={config} />;
      case "checklist": return <ChecklistPage />;
      case "lablog": return <LabLogPage />;
      default: return <DashboardPage setActiveModule={setActiveModule} config={config} currentTopic={currentTopic} />;
    }
  };

  const provInfo = AI_PROVIDERS[config.provider];
  const currentTopic = topics.find(t => t.id === activeTopicId) || topics[0];
  const addTopic = () => {
    if (!topicName.trim()) return;
    const t = { id: Date.now(), name: topicName.trim(), status: "进行中" };
    setTopics(prev => [...prev, t]);
    setActiveTopicId(t.id);
    setTopicName("");
  };
  const deleteTopic = (id) => {
    setTopics(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(t => t.id !== id);
      if (!next.find(t => t.id === activeTopicId)) setActiveTopicId(next[0].id);
      return next;
    });
  };
  const topicDrag = useDragReorder((fromIndex, toIndex) => setTopics(prev => reorderList(prev, fromIndex, toIndex)));

  return (
    <AIConfigContext.Provider value={config}>
      <style>{CSS}</style>
      <div className="app-container">
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo"><div className="logo-mark">SF</div><span className="logo-text">SciFlow</span></div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <div className="project-selector"><span className="project-name">{currentTopic?.name}</span><span className="project-tag">{currentTopic?.status}</span></div>
              <select className="input-field" value={activeTopicId} onChange={e=>setActiveTopicId(Number(e.target.value))}>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
              <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:140,overflowY:'auto'}}>
                {topics.map((t, index)=><div key={t.id} className={`group-item ${activeTopicId===t.id?'active':''} ${topicDrag.draggingIndex===index?'dragging':''}`} style={{marginBottom:0}} onClick={()=>setActiveTopicId(t.id)} draggable onDragStart={topicDrag.startDrag(index)} onDragOver={topicDrag.dragOver} onDrop={topicDrag.dropAt(index)} onDragEnd={topicDrag.endDrag}><span className="drag-handle" title="拖拽排序">⋮⋮</span><span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</span><button className="btn btn-secondary btn-sm" style={{padding:'2px 8px',color:'var(--accent-pink)'}} onClick={(e)=>{e.stopPropagation();deleteTopic(t.id);}} disabled={topics.length<=1}>删</button></div>)}
              </div>
              <div style={{display:'flex',gap:6}}><input className="input-field" placeholder="新增课题" value={topicName} onChange={e=>setTopicName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTopic()}/><button className="btn btn-secondary btn-sm" onClick={addTopic}><Icons.Plus/></button></div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeModule === 'home' ? 'active' : ''}`} onClick={() => { setActiveModule('home'); setSidebarOpen(false); }}>
              <div className="nav-icon" style={{ background: 'rgba(232,233,240,.05)', color: 'var(--text-secondary)' }}><Icons.Home /></div>概览
            </div>
            <div className="nav-section-label">研究模块</div>
            {MODULES.map(m => (
              <div key={m.id} className={`nav-item ${activeModule === m.id ? 'active' : ''}`} onClick={() => { setActiveModule(m.id); setSidebarOpen(false); }}>
                <div className="nav-icon" style={{ background: activeModule === m.id ? `${m.color}20` : 'rgba(232,233,240,.04)', color: activeModule === m.id ? m.color : 'var(--text-muted)' }}><m.icon /></div>
                {m.label}{AI_MODS.includes(m.id) && <AIBadge small />}
                {activeModule === m.id && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 2px 2px 0', background: m.color }} />}
              </div>
            ))}
            <div className="nav-section-label">系统</div>
            <div className={`nav-item ${activeModule === 'settings' ? 'active' : ''}`} onClick={() => { setActiveModule('settings'); setSidebarOpen(false); }}>
              <div className="nav-icon" style={{ background: activeModule === 'settings' ? 'rgba(167,139,250,.15)' : 'rgba(232,233,240,.04)', color: activeModule === 'settings' ? 'var(--ai-glow)' : 'var(--text-muted)' }}><Icons.Settings /></div>
              AI 配置
              <span style={{ marginLeft: 'auto', fontSize: 14 }}>{provInfo?.icon}</span>
              {activeModule === 'settings' && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 2px 2px 0', background: 'var(--ai-glow)' }} />}
            </div>
          </nav>
          <div className="sidebar-footer"><div className="avatar">LW</div><div className="user-info"><div className="user-name">Li Wei</div><div className="user-role">博士研究生</div></div></div>
        </aside>
        <main className="main-content">
          <div className="topbar">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}><Icons.Menu /></button>
            <div className="breadcrumb"><span style={{ cursor: 'pointer' }} onClick={() => setActiveModule('home')}>SciFlow</span><Icons.ChevronRight /><span className="breadcrumb-current">{title}</span></div>
            <div className="topbar-actions">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{provInfo?.icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ai-glow)' }}>{config.customModel || config.model}</span>
              </div>
              <div className="topbar-search"><Icons.Search /><input placeholder="全局搜索..." /></div>
            </div>
          </div>
          <div className="page-content" key={activeModule}>{render()}</div>
        </main>
      </div>
      <AIChatDrawer config={config} />
    </AIConfigContext.Provider>
  );
}
