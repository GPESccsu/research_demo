const Sparkle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>;

export default function WritingEditor({ text, onTextChange, sectionLabel, onSectionLabelChange, onAnalyze, analyzing }) {
  return (
    <div className="writing-editor fade-in delay-1">
      <div className="editor-toolbar">
        {"B,I,H2,引用".split(',').map(b => <button key={b} className="tool-btn">{b}</button>)}
        <div style={{ marginLeft: 'auto' }}>
          <button className="tool-btn ai-tool" onClick={onAnalyze} disabled={analyzing}><Sparkle />AI 分析</button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        <input
          className="input-field"
          value={sectionLabel}
          onChange={e => onSectionLabelChange(e.target.value)}
          style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, marginBottom: 14, maxWidth: 360 }}
        />
        <textarea
          className="editor-textarea"
          value={text}
          onChange={e => onTextChange(e.target.value)}
          style={{ minHeight: 260 }}
        />
      </div>
    </div>
  );
}
