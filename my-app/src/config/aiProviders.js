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

export default AI_PROVIDERS;
