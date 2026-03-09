import { useState } from "react";

const Sparkle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>;
const Send = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

function TypingDots() {
  return <span className="typing-dots"><span className="dot" /><span className="dot" /><span className="dot" /></span>;
}

function AIBadge() {
  return <span className="ai-badge ai-badge-sm"><Sparkle /> AI</span>;
}

const PRIORITY_COLORS = {
  high: 'var(--accent-orange)',
  medium: 'var(--accent-amber)',
  low: 'var(--accent-blue)',
};

export default function WritingAIPanel({ suggestions, setSuggestions, analyzing, onAsk, onInsertToEditor }) {
  const [question, setQuestion] = useState("");

  const handleAsk = () => {
    if (!question.trim()) return;
    onAsk(question);
    setQuestion("");
  };

  const editSuggestion = (i, val) => setSuggestions(prev => prev.map((s, idx) => idx === i ? { ...s, content: val } : s));
  const removeSuggestion = (i) => setSuggestions(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="writing-ai-panel fade-in delay-2">
      <div className="ai-panel-header"><Sparkle />AI 写作助手<AIBadge /></div>
      <div className="ai-panel-body">
        {suggestions.length === 0 && !analyzing && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: .4 }}>✨</div>
            点击「AI 分析」获取建议
          </div>
        )}
        {analyzing && (
          <div className="ai-suggestion">
            <div className="ai-suggestion-label"><Sparkle />分析中...</div>
            <TypingDots />
          </div>
        )}
        {suggestions.map((s, i) => (
          <div key={i} className="ai-suggestion">
            <div className="ai-suggestion-label">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[s.priority] || 'var(--ai-glow)' }} />
              {s.type}
              {onInsertToEditor && (
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 6, padding: '2px 8px' }} onClick={() => onInsertToEditor(s.content)}>
                  插入正文
                </button>
              )}
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto', padding: '2px 8px' }} onClick={() => removeSuggestion(i)}>删除</button>
            </div>
            <textarea className="input-field" rows={3} value={s.content} onChange={e => editSuggestion(i, e.target.value)} style={{ marginTop: 6, resize: 'vertical' }} />
          </div>
        ))}
      </div>
      <div className="ai-panel-input">
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="问AI..." onKeyDown={e => e.key === 'Enter' && handleAsk()} />
        <button className="btn btn-ai btn-sm" onClick={handleAsk} disabled={!question.trim() || analyzing}><Send /></button>
      </div>
    </div>
  );
}
