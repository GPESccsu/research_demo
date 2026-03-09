import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "acw-library-v2";

// Utility
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Initial demo data
const DEMO_DATA = {
  sentences: [
    {
      id: "s1",
      order: 1,
      label: "句话1",
      prompt: "锂电池在哪些领域被广泛应用 + 原因（即锂电池的优点）",
      elements: [
        { id: "e1", tag: "A", desc: "广泛应用领域" },
        { id: "e2", tag: "B", desc: "优点/原因" },
      ],
      examples: [
        {
          id: "ex1",
          text: "Lithium-ion batteries (LIBs) are the fastest developing energy storage systems, and have widespread application in mobile phones, laptops, electric vehicles, etc.",
          source: "F. Wang et al., APPLIED SCIENCES-BASEL, 10 (2020)",
          tags: ["A", "B"],
          notes: "提及锂电池在手机、笔记本电脑、电动汽车中的应用",
        },
        {
          id: "ex2",
          text: "Because of their high energy and power density, lithium ion batteries (LIBs) are currently the most promising energy storage technology for mobile devices, electric vehicles, and large-scale energy storage.",
          source: "C. Jo et al., ACS NANO, 14 (2020) 698-707",
          tags: ["A", "B"],
          notes: "因为xxx优点，是目前最有前途的储能技术",
        },
      ],
      draft: "",
    },
  ],
};

// Colors
const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceHover: "#222633",
  border: "#2a2e3d",
  borderFocus: "#5b6abf",
  text: "#e8e9ed",
  textMuted: "#8b8fa3",
  textDim: "#5c6078",
  accent: "#6c7bd4",
  accentSoft: "#6c7bd420",
  green: "#4ade80",
  greenSoft: "#4ade8018",
  amber: "#fbbf24",
  amberSoft: "#fbbf2418",
  red: "#f87171",
  redSoft: "#f8717118",
  purple: "#a78bfa",
  purpleSoft: "#a78bfa18",
  cyan: "#22d3ee",
  cyanSoft: "#22d3ee15",
};

const TAG_COLORS = {
  A: { bg: "#3b82f620", color: "#60a5fa", border: "#3b82f640" },
  B: { bg: "#10b98120", color: "#34d399", border: "#10b98140" },
  C: { bg: "#f59e0b20", color: "#fbbf24", border: "#f59e0b40" },
  D: { bg: "#ef444420", color: "#f87171", border: "#ef444440" },
  E: { bg: "#8b5cf620", color: "#a78bfa", border: "#8b5cf640" },
  F: { bg: "#ec489920", color: "#f472b6", border: "#ec489940" },
};

const getTagColor = (tag) => TAG_COLORS[tag] || TAG_COLORS["A"];

// ─── Small Components ───

function Badge({ children, color = C.accent, bg = C.accentSoft, border, small }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: small ? "1px 6px" : "2px 10px",
        borderRadius: 4,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        color,
        background: bg,
        border: border ? `1px solid ${border}` : "none",
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}

function IconBtn({ onClick, title, children, danger, size = 28 }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderRadius: 5,
        background: hov ? (danger ? C.redSoft : C.surfaceHover) : "transparent",
        color: danger ? C.red : C.textMuted,
        cursor: "pointer",
        fontSize: 15,
        transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

function Btn({ children, onClick, variant = "default", style: s = {}, small, disabled }) {
  const [hov, setHov] = useState(false);
  const styles = {
    primary: {
      bg: C.accent,
      bgH: "#7b8ae0",
      color: "#fff",
      border: "none",
    },
    default: {
      bg: C.surface,
      bgH: C.surfaceHover,
      color: C.text,
      border: `1px solid ${C.border}`,
    },
    ghost: {
      bg: "transparent",
      bgH: C.accentSoft,
      color: C.accent,
      border: "none",
    },
    danger: {
      bg: "transparent",
      bgH: C.redSoft,
      color: C.red,
      border: `1px solid ${C.border}`,
    },
  };
  const v = styles[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: small ? "4px 10px" : "7px 16px",
        borderRadius: 6,
        fontSize: small ? 12 : 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        border: v.border,
        background: hov ? v.bgH : v.bg,
        color: v.color,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        transition: "all .15s",
        ...s,
      }}
    >
      {children}
    </button>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3, style: s = {} }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%",
        padding: "8px 12px",
        borderRadius: 6,
        border: `1px solid ${C.border}`,
        background: C.bg,
        color: C.text,
        fontSize: 13,
        lineHeight: 1.6,
        resize: "vertical",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        ...s,
      }}
      onFocus={(e) => (e.target.style.borderColor = C.borderFocus)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  );
}

function Input({ value, onChange, placeholder, style: s = {} }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "7px 12px",
        borderRadius: 6,
        border: `1px solid ${C.border}`,
        background: C.bg,
        color: C.text,
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        ...s,
      }}
      onFocus={(e) => (e.target.style.borderColor = C.borderFocus)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  );
}

// ─── Example Card ───
function ExampleCard({ ex, elements, onUpdate, onDelete, sentenceDraft, onInsertToDraft }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(ex.text);
  const [editSource, setEditSource] = useState(ex.source || "");
  const [editNotes, setEditNotes] = useState(ex.notes || "");

  const handleSave = () => {
    onUpdate({ ...ex, text: editText, source: editSource, notes: editNotes });
    setEditing(false);
  };

  // Highlight matching tags
  const tagBadges = (ex.tags || []).map((t) => {
    const tc = getTagColor(t);
    const el = elements.find((e) => e.tag === t);
    return (
      <Badge key={t} color={tc.color} bg={tc.bg} border={tc.border} small>
        {t}: {el ? el.desc : ""}
      </Badge>
    );
  });

  if (editing) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.borderFocus}`, borderRadius: 8, padding: 14, marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>编辑例句</div>
        <TextArea value={editText} onChange={setEditText} placeholder="例句内容..." rows={3} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Input value={editSource} onChange={setEditSource} placeholder="来源（期刊、作者等）" style={{ flex: 1 }} />
        </div>
        <TextArea value={editNotes} onChange={setEditNotes} placeholder="笔记/分析..." rows={2} style={{ marginTop: 8 }} />
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {elements.map((el) => {
            const active = (ex.tags || []).includes(el.tag);
            const tc = getTagColor(el.tag);
            return (
              <Btn
                key={el.id}
                small
                variant={active ? "primary" : "default"}
                style={active ? { background: tc.color, color: "#000" } : {}}
                onClick={() => {
                  const tags = active ? ex.tags.filter((t) => t !== el.tag) : [...(ex.tags || []), el.tag];
                  onUpdate({ ...ex, tags });
                }}
              >
                {el.tag}: {el.desc}
              </Btn>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
          <Btn small onClick={() => setEditing(false)}>取消</Btn>
          <Btn small variant="primary" onClick={handleSave}>保存</Btn>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 8,
        transition: "border-color .2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>{tagBadges}</div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: C.text,
              cursor: "pointer",
            }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? ex.text : ex.text.length > 160 ? ex.text.slice(0, 160) + "..." : ex.text}
          </div>
          {ex.source && (
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>📎 {ex.source}</div>
          )}
          {expanded && ex.notes && (
            <div style={{ fontSize: 12, color: C.amber, marginTop: 6, padding: "6px 10px", background: C.amberSoft, borderRadius: 5 }}>
              💡 {ex.notes}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <IconBtn title="编辑" onClick={() => { setEditing(true); setEditText(ex.text); setEditSource(ex.source || ""); setEditNotes(ex.notes || ""); }}>✏️</IconBtn>
          <IconBtn title="插入草稿" onClick={() => onInsertToDraft(ex.text)}>📋</IconBtn>
          <IconBtn title="删除" danger onClick={() => onDelete(ex.id)}>✕</IconBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Sentence Panel ───
function SentencePanel({ sentence, onUpdate, onDelete }) {
  const [showAddExample, setShowAddExample] = useState(false);
  const [newExText, setNewExText] = useState("");
  const [newExSource, setNewExSource] = useState("");
  const [newExTags, setNewExTags] = useState([]);
  const [editPrompt, setEditPrompt] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const s = sentence;

  const addElement = () => {
    const usedTags = s.elements.map((e) => e.tag);
    const nextTag = "ABCDEF".split("").find((t) => !usedTags.includes(t)) || "X";
    onUpdate({
      ...s,
      elements: [...s.elements, { id: uid(), tag: nextTag, desc: "" }],
    });
  };

  const updateElement = (id, desc) => {
    onUpdate({
      ...s,
      elements: s.elements.map((e) => (e.id === id ? { ...e, desc } : e)),
    });
  };

  const removeElement = (id) => {
    onUpdate({ ...s, elements: s.elements.filter((e) => e.id !== id) });
  };

  const addExample = () => {
    if (!newExText.trim()) return;
    const ex = { id: uid(), text: newExText.trim(), source: newExSource.trim(), tags: newExTags, notes: "" };
    onUpdate({ ...s, examples: [...s.examples, ex] });
    setNewExText("");
    setNewExSource("");
    setNewExTags([]);
    setShowAddExample(false);
  };

  const updateExample = (ex) => {
    onUpdate({ ...s, examples: s.examples.map((e) => (e.id === ex.id ? ex : e)) });
  };

  const deleteExample = (exId) => {
    onUpdate({ ...s, examples: s.examples.filter((e) => e.id !== exId) });
  };

  const insertToDraft = (text) => {
    onUpdate({ ...s, draft: s.draft ? s.draft + "\n\n---参考---\n" + text : text });
  };

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: C.textDim, transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform .2s" }}>▼</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>第{s.order}句</span>
          <span style={{ fontSize: 13, color: C.textMuted, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {s.prompt || "点击设置提示语..."}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <Badge color={C.green} bg={C.greenSoft}>{s.examples.length} 例句</Badge>
          <Badge color={C.purple} bg={C.purpleSoft}>{s.elements.length} 要素</Badge>
          <IconBtn title="删除此句" danger onClick={() => onDelete(s.id)}>✕</IconBtn>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: 16 }}>
          {/* Prompt */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              📝 表达目标（这句话要表达什么）
              <IconBtn size={22} onClick={() => setEditPrompt(!editPrompt)}>✏️</IconBtn>
            </div>
            {editPrompt ? (
              <TextArea value={s.prompt} onChange={(v) => onUpdate({ ...s, prompt: v })} placeholder="描述这句话要表达的内容..." rows={2} />
            ) : (
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, padding: "6px 0" }}>
                {s.prompt || <span style={{ color: C.textDim, fontStyle: "italic" }}>点击编辑按钮设置...</span>}
              </div>
            )}
          </div>

          {/* Elements */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>🧩 表达要素（A + B + ...）</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {s.elements.map((el) => {
                const tc = getTagColor(el.tag);
                return (
                  <div
                    key={el.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: tc.bg,
                      border: `1px solid ${tc.border}`,
                      borderRadius: 6,
                      padding: "4px 6px 4px 10px",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: tc.color, fontSize: 13 }}>{el.tag}:</span>
                    <input
                      value={el.desc}
                      onChange={(e) => updateElement(el.id, e.target.value)}
                      placeholder="要素描述"
                      style={{
                        border: "none",
                        background: "transparent",
                        color: C.text,
                        fontSize: 12,
                        width: 120,
                        outline: "none",
                      }}
                    />
                    <IconBtn size={20} danger onClick={() => removeElement(el.id)}>✕</IconBtn>
                  </div>
                );
              })}
              <Btn small variant="ghost" onClick={addElement}>+ 要素</Btn>
            </div>
          </div>

          {/* Examples */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>📚 例句素材库（比大小法：浏览、归纳、选择）</span>
              <Btn small variant="ghost" onClick={() => setShowAddExample(true)}>+ 添加例句</Btn>
            </div>

            {showAddExample && (
              <div style={{ background: C.surface, border: `1px solid ${C.borderFocus}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <TextArea value={newExText} onChange={setNewExText} placeholder="粘贴例句..." rows={3} />
                <Input value={newExSource} onChange={setNewExSource} placeholder="来源（期刊/作者/年份）" style={{ marginTop: 6 }} />
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: C.textMuted, lineHeight: "28px" }}>标记要素：</span>
                  {s.elements.map((el) => {
                    const active = newExTags.includes(el.tag);
                    const tc = getTagColor(el.tag);
                    return (
                      <Btn
                        key={el.id}
                        small
                        variant={active ? "primary" : "default"}
                        style={active ? { background: tc.color, color: "#000" } : {}}
                        onClick={() => setNewExTags(active ? newExTags.filter((t) => t !== el.tag) : [...newExTags, el.tag])}
                      >
                        {el.tag}
                      </Btn>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
                  <Btn small onClick={() => setShowAddExample(false)}>取消</Btn>
                  <Btn small variant="primary" onClick={addExample} disabled={!newExText.trim()}>添加</Btn>
                </div>
              </div>
            )}

            {s.examples.length === 0 && (
              <div style={{ textAlign: "center", padding: 24, color: C.textDim, fontSize: 13 }}>
                暂无例句，点击"添加例句"开始收集素材
              </div>
            )}
            {s.examples.map((ex) => (
              <ExampleCard
                key={ex.id}
                ex={ex}
                elements={s.elements}
                onUpdate={updateExample}
                onDelete={deleteExample}
                sentenceDraft={s.draft}
                onInsertToDraft={insertToDraft}
              />
            ))}
          </div>

          {/* Draft */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 6 }}>✍️ 写作草稿（重组生成你的表达）</div>
            <TextArea
              value={s.draft}
              onChange={(v) => onUpdate({ ...s, draft: v })}
              placeholder="在此写作...可以从例句中借鉴主干结构和短语，重组形成你自己的表达。用 / 分隔备选表达。"
              rows={4}
              style={{ borderColor: C.borderFocus + "60" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("write"); // write | preview | help
  const [projectName, setProjectName] = useState("我的论文引言");
  const [editName, setEditName] = useState(false);

  // Load
  useEffect(() => {
    const load = async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setData(parsed);
          setProjectName(parsed.projectName || "我的论文引言");
          return;
        }
      } catch (e) {}
      setData({ sentences: [], projectName: "我的论文引言" });
    };
    load();
  }, []);

  // Save
  useEffect(() => {
    if (!data) return;
    const save = async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ ...data, projectName }));
      } catch (e) {}
    };
    save();
  }, [data, projectName]);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.text }}>
        <div style={{ fontSize: 14 }}>加载中...</div>
      </div>
    );
  }

  const sentences = data.sentences || [];

  const updateSentence = (s) => {
    setData({ ...data, sentences: sentences.map((x) => (x.id === s.id ? s : x)) });
  };

  const deleteSentence = (id) => {
    if (!confirm("确定删除这句话及其所有例句吗？")) return;
    const updated = sentences.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i + 1 }));
    setData({ ...data, sentences: updated });
  };

  const addSentence = () => {
    const newS = {
      id: uid(),
      order: sentences.length + 1,
      label: `句话${sentences.length + 1}`,
      prompt: "",
      elements: [
        { id: uid(), tag: "A", desc: "" },
        { id: uid(), tag: "B", desc: "" },
      ],
      examples: [],
      draft: "",
    };
    setData({ ...data, sentences: [...sentences, newS] });
  };

  const loadDemo = () => {
    if (sentences.length > 0 && !confirm("加载演示数据会覆盖当前数据，确定吗？")) return;
    setData(DEMO_DATA);
    setProjectName("锂电池硅负极论文引言");
  };

  const clearAll = () => {
    if (!confirm("确定清除所有数据吗？此操作不可恢复。")) return;
    setData({ sentences: [], projectName: "我的论文引言" });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ ...data, projectName }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Preview
  const previewText = sentences
    .map((s, i) => {
      const draft = (s.draft || "").split("---参考---")[0].trim();
      return draft ? `${draft}` : `[第${i + 1}句：未完成]`;
    })
    .join(" ");

  // Tab styles
  const tabStyle = (active) => ({
    padding: "8px 18px",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
    background: "transparent",
    color: active ? C.accent : C.textMuted,
    cursor: "pointer",
    transition: "all .15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Noto Sans SC', 'SF Pro Text', -apple-system, sans-serif" }}>
      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>📖</span>
          {editName ? (
            <input
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setEditName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditName(false)}
              style={{
                border: `1px solid ${C.borderFocus}`,
                background: C.bg,
                color: C.text,
                fontSize: 16,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 4,
                outline: "none",
              }}
            />
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700, cursor: "pointer" }} onClick={() => setEditName(true)}>
              {projectName}
            </span>
          )}
          <Badge color={C.cyan} bg={C.cyanSoft}>{sentences.length} 句</Badge>
          <Badge color={C.green} bg={C.greenSoft}>{sentences.reduce((n, s) => n + s.examples.length, 0)} 例句</Badge>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn small onClick={loadDemo}>📥 演示数据</Btn>
          <Btn small onClick={exportData}>💾 导出</Btn>
          <Btn small variant="danger" onClick={clearAll}>🗑 清除</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", gap: 4 }}>
        <button style={tabStyle(tab === "write")} onClick={() => setTab("write")}>📝 写作工作台</button>
        <button style={tabStyle(tab === "preview")} onClick={() => setTab("preview")}>👁 预览全文</button>
        <button style={tabStyle(tab === "help")} onClick={() => setTab("help")}>❓ 方法指南</button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>
        {tab === "write" && (
          <>
            {sentences.map((s) => (
              <SentencePanel key={s.id} sentence={s} onUpdate={updateSentence} onDelete={deleteSentence} />
            ))}
            <div style={{ textAlign: "center", padding: 20 }}>
              <Btn variant="primary" onClick={addSentence} style={{ padding: "10px 28px", fontSize: 14 }}>
                + 添加新句话
              </Btn>
            </div>
          </>
        )}

        {tab === "preview" && (
          <div style={{ background: C.surface, borderRadius: 10, padding: 24, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: C.accent }}>📄 全文预览</div>
            {sentences.length === 0 ? (
              <div style={{ color: C.textDim, textAlign: "center", padding: 30 }}>暂无内容，请在写作工作台添加句话</div>
            ) : (
              <div style={{ fontSize: 14, lineHeight: 2, color: C.text, whiteSpace: "pre-wrap" }}>
                {sentences.map((s, i) => {
                  const draft = (s.draft || "").split("---参考---")[0].trim();
                  if (!draft) {
                    return (
                      <span key={s.id} style={{ color: C.red, background: C.redSoft, padding: "0 6px", borderRadius: 3, marginRight: 4 }}>
                        [第{i + 1}句未完成]
                      </span>
                    );
                  }
                  return <span key={s.id}>{draft} </span>;
                })}
              </div>
            )}
            {sentences.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 10 }}>各句状态</div>
                {sentences.map((s, i) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: (s.draft || "").split("---参考---")[0].trim() ? C.green : C.red }}>
                      {(s.draft || "").split("---参考---")[0].trim() ? "✓" : "○"}
                    </span>
                    <span style={{ color: C.textMuted }}>第{i + 1}句</span>
                    <span style={{ color: C.textDim }}>{s.prompt ? `— ${s.prompt.slice(0, 60)}` : ""}</span>
                    <Badge small color={C.textMuted} bg={C.surfaceHover}>{s.examples.length} 例句</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "help" && (
          <div style={{ background: C.surface, borderRadius: 10, padding: 24, border: `1px solid ${C.border}`, fontSize: 13, lineHeight: 2, color: C.text }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginTop: 0, marginBottom: 16 }}>📘 科研论文写作方法指南</h2>
            
            <h3 style={{ color: C.green, fontSize: 15, marginBottom: 8 }}>核心思路</h3>
            <p style={{ color: C.textMuted }}>
              本工具基于"文字素材库"方法论。核心是：不需要你凭空造句，而是通过收集、比较、重组已发表文献中的表达来生成你自己的原创句子。就像做"选择题"而非"填空题"。
            </p>

            <h3 style={{ color: C.amber, fontSize: 15, marginTop: 20, marginBottom: 8 }}>🔄 操作步骤</h3>
            
            <div style={{ background: C.bg, borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.cyan, marginBottom: 4 }}>第一步：确定表达要素（A+B+C...）</div>
              <p style={{ color: C.textMuted, margin: 0 }}>
                明确这句话需要传达的几个核心信息点。比如第1句话需要表达：A-锂电池的广泛应用 + B-原因/优点。在工具中点击"添加新句话"，然后设置表达目标和要素。
              </p>
            </div>

            <div style={{ background: C.bg, borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.cyan, marginBottom: 4 }}>第二步：收集例句（约10句/要点）</div>
              <p style={{ color: C.textMuted, margin: 0 }}>
                从已发表的文献中，找到表达类似含义的句子，粘贴到对应的句话中。用标签标记每句例句涉及哪些要素。注意记录来源便于后续引用。
              </p>
            </div>

            <div style={{ background: C.bg, borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.cyan, marginBottom: 4 }}>第三步：归纳比较（比大小法）</div>
              <p style={{ color: C.textMuted, margin: 0 }}>
                浏览所有例句，进行归纳分类。观察例句中的"主干结构"（句式框架）和"填充内容"（具体词汇短语）。找出哪些结构和短语最适合你的表达需求。
              </p>
            </div>

            <div style={{ background: C.bg, borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.cyan, marginBottom: 4 }}>第四步：重组生成（枝干+树叶）</div>
              <p style={{ color: C.textMuted, margin: 0 }}>
                选择一个主干结构（枝干），再从不同例句中选取合适的短语/单词（树叶）来填充。在草稿区写下你的表达，用 / 分隔备选方案。确保与任何单一例句的连续重复不超过5个词。
              </p>
            </div>

            <div style={{ background: C.bg, borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.cyan, marginBottom: 4 }}>第五步：检查与润色</div>
              <p style={{ color: C.textMuted, margin: 0 }}>
                在"预览全文"中检查整体连贯性。确保：不与原文大面积重复（连续重复词≤4个）；同一文献来源占比不超过15%；必要处保留文献引用。
              </p>
            </div>

            <h3 style={{ color: C.purple, fontSize: 15, marginTop: 20, marginBottom: 8 }}>💡 关键原则</h3>
            <div style={{ background: C.bg, borderRadius: 8, padding: 16 }}>
              <p style={{ color: C.textMuted, margin: "0 0 8px" }}>
                <strong style={{ color: C.text }}>以终为始：</strong>先知道要表达什么，再去找素材，而非看到什么就写什么。
              </p>
              <p style={{ color: C.textMuted, margin: "0 0 8px" }}>
                <strong style={{ color: C.text }}>结构优先：</strong>先确定主干结构（with.../ whose.../ are...），再填充具体内容。
              </p>
              <p style={{ color: C.textMuted, margin: "0 0 8px" }}>
                <strong style={{ color: C.text }}>同义替换：</strong>同一含义的表达至少找2-3种不同表述方式，然后重组。
              </p>
              <p style={{ color: C.textMuted, margin: 0 }}>
                <strong style={{ color: C.text }}>不构成抄袭：</strong>你的句子来源于多个不同例句的要素重组，与任何单一原文都有明显区分。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
