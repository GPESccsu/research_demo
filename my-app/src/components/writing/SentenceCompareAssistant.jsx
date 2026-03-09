import { useState } from "react";
import { callAIJSON } from "../../services/aiService";
import { PROMPTS } from "../../prompts/index";

const Sparkle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>;

function TypingDots() {
  return <span className="typing-dots"><span className="dot" /><span className="dot" /><span className="dot" /></span>;
}

const DIMENSION_LABELS = {
  grammar: "语法与结构",
  academic: "学术性",
  conciseness: "简洁性",
  accuracy: "准确性",
};

const DIMENSION_COLORS = {
  grammar: "var(--accent-blue)",
  academic: "var(--accent-purple)",
  conciseness: "var(--accent-green)",
  accuracy: "var(--accent-amber)",
};

export default function SentenceCompareAssistant({ config, onInsertToEditor }) {
  const [sentenceA, setSentenceA] = useState("");
  const [sentenceB, setSentenceB] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const compare = async () => {
    if (!sentenceA.trim() || !sentenceB.trim()) return;
    setLoading(true);
    setResult(null);
    const r = await callAIJSON(
      config,
      PROMPTS.SENTENCE_COMPARE,
      `句子A: ${sentenceA}\n句子B: ${sentenceB}`,
      1200,
    );
    setLoading(false);
    if (r) setResult(r);
  };

  const handleInsert = () => {
    if (result?.improved && onInsertToEditor) {
      onInsertToEditor(result.improved);
    }
  };

  if (!open) {
    return (
      <button
        className="btn btn-secondary btn-sm"
        style={{ margin: '12px 0', width: '100%', justifyContent: 'center', gap: 6 }}
        onClick={() => setOpen(true)}
      >
        <Sparkle /> 贼哥句子比较器
      </button>
    );
  }

  return (
    <div className="panel" style={{ margin: '12px 0', border: '1px solid rgba(167,139,250,.25)' }}>
      <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>
        <Sparkle />
        贼哥句子比较器助手
        <span className="ai-badge ai-badge-sm" style={{ marginLeft: 6 }}><Sparkle /> AI</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>点击收起</span>
      </div>
      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="form-label" style={{ color: 'var(--accent-blue)' }}>句子 A</div>
          <textarea
            className="input-field"
            rows={2}
            value={sentenceA}
            onChange={e => setSentenceA(e.target.value)}
            placeholder="输入第一个句子..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div>
          <div className="form-label" style={{ color: 'var(--accent-purple)' }}>句子 B</div>
          <textarea
            className="input-field"
            rows={2}
            value={sentenceB}
            onChange={e => setSentenceB(e.target.value)}
            placeholder="输入第二个句子..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <button
          className="btn btn-ai"
          onClick={compare}
          disabled={loading || !sentenceA.trim() || !sentenceB.trim()}
          style={{ alignSelf: 'flex-start' }}
        >
          <Sparkle />{loading ? '比较中...' : 'AI 对比分析'}
        </button>

        {loading && <TypingDots />}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Dimension analysis */}
            {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
              result[key] && (
                <div key={key} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: DIMENSION_COLORS[key], marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{result[key]}</div>
                </div>
              )
            ))}

            {/* Recommendation */}
            <div style={{
              padding: '12px 14px',
              background: 'linear-gradient(135deg,rgba(124,58,237,.06),rgba(167,139,250,.04))',
              border: '1px solid rgba(167,139,250,.2)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Sparkle />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ai-glow)' }}>
                  推荐: 句子 {result.recommendation}
                </span>
              </div>
              {result.reason && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{result.reason}</div>
              )}
              {result.improved && (
                <div style={{ padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600, marginBottom: 4 }}>改进版本</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{result.improved}</div>
                  {onInsertToEditor && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleInsert}>
                      插入正文
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
