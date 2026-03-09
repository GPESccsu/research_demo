import { useState, useEffect } from "react";
import { AI_PROVIDERS } from "../services/promptService";
import { callAI } from "../services/aiService";
import { fetchOllamaModels } from "../services/ollamaService";
import { PROMPTS, TEST_USER_MESSAGE } from "../prompts/index";

// ── Icons used by SettingsPage ──
const Icons = {
  ExternalLink: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Sparkle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  AlertCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Loader: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

export default function SettingsPage({ config, setConfig }) {
  const [testStatus, setTestStatus] = useState(null); // null | "loading" | "success" | "error"
  const [testMsg, setTestMsg] = useState("");
  const [ollamaModels, setOllamaModels] = useState([]);
  const provider = AI_PROVIDERS[config.provider];
  const isOllama = config.provider === "ollama";

  // Fetch Ollama models when Ollama selected
  useEffect(() => {
    if (isOllama) {
      fetchOllamaModels(config.ollamaUrl).then(setOllamaModels);
    }
  }, [isOllama, config.ollamaUrl]);

  const testConnection = async () => {
    setTestStatus("loading"); setTestMsg("正在测试连接...");
    const result = await callAI(config, PROMPTS.TEST_SYSTEM, TEST_USER_MESSAGE, 100);
    if (result) { setTestStatus("success"); setTestMsg(`连接成功！回复: "${result.slice(0, 60)}"`); }
    else { setTestStatus("error"); setTestMsg("连接失败，请检查配置。"); }
  };

  // Ollama: only show locally installed models; other providers: show predefined list
  const displayModels = isOllama && ollamaModels.length > 0 ? ollamaModels : provider.models;

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
          {isOllama && (
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
            <div className="form-label">选择模型 {isOllama && ollamaModels.length > 0 &&
              <span style={{ fontSize: 10, color: 'var(--accent-green)' }}>（已检测到 {ollamaModels.length} 个本地模型）</span>}
              {isOllama && ollamaModels.length === 0 &&
              <span style={{ fontSize: 10, color: 'var(--accent-orange)' }}>（未检测到本地模型，请先通过 ollama pull 安装模型）</span>}
            </div>
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

          {/* Custom Model — hidden for Ollama to prevent using uninstalled models */}
          {!isOllama && (
            <div className="form-group">
              <div className="form-label">自定义模型名 <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>（可选，覆盖上方选择）</span></div>
              <input className="input-field" value={config.customModel}
                onChange={e => setConfig(c => ({ ...c, customModel: e.target.value }))}
                placeholder="例如: model-name" />
            </div>
          )}

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
