import { useState, useCallback, useEffect, useRef } from "react";

// ============================================================
// DESIGN: Dark academia meets laboratory aesthetic
// Font: Source Han Sans (Noto Sans SC) for Chinese, Crimson Text for accents
// Palette: Deep navy/slate base, amber highlights, emerald success, coral warnings
// ============================================================

const T = {
  bg: "#0b0f1a",
  card: "#111827",
  cardHover: "#1a2234",
  surface: "#1e293b",
  border: "#2a3548",
  borderActive: "#4a7cff",
  text: "#e8ecf4",
  textSecondary: "#8b9ab8",
  textMuted: "#5a6a84",
  accent: "#f0a500",
  accentDim: "#f0a50033",
  blue: "#4a7cff",
  blueDim: "#4a7cff22",
  green: "#34d399",
  greenDim: "#34d39922",
  red: "#f87171",
  redDim: "#f8717122",
  purple: "#a78bfa",
  purpleDim: "#a78bfa22",
  cyan: "#22d3ee",
};

const font = `'Noto Sans SC', 'Segoe UI', system-ui, sans-serif`;

// ============================================================
// Shared Components
// ============================================================

const Badge = ({ children, color = T.accent, style }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "2px 10px",
    background: color + "18", color, borderRadius: 99, fontSize: 11,
    fontWeight: 600, letterSpacing: 0.3, ...style,
  }}>{children}</span>
);

const Btn = ({ children, onClick, variant = "primary", style, disabled }) => {
  const styles = {
    primary: { bg: T.blue, color: "#fff", border: "none" },
    secondary: { bg: T.surface, color: T.textSecondary, border: `1px solid ${T.border}` },
    danger: { bg: T.redDim, color: T.red, border: `1px solid ${T.red}44` },
    success: { bg: T.greenDim, color: T.green, border: `1px solid ${T.green}44` },
    ghost: { bg: "transparent", color: T.textSecondary, border: `1px dashed ${T.border}` },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 16px", background: s.bg, color: s.color, border: s.border,
      borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontSize: 13,
      fontWeight: 600, fontFamily: font, transition: "all .15s",
      opacity: disabled ? 0.5 : 1, ...style,
    }}>{children}</button>
  );
};

const Input = ({ value, onChange, placeholder, style, onKeyDown, multiline, rows = 3 }) => {
  const shared = {
    width: "100%", padding: "10px 14px", background: T.bg,
    border: `1px solid ${T.border}`, borderRadius: 8, color: T.text,
    fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box",
    transition: "border-color .15s", ...style,
  };
  if (multiline) return (
    <textarea value={value} onChange={onChange} placeholder={placeholder}
      rows={rows} onKeyDown={onKeyDown}
      style={{ ...shared, resize: "vertical" }}
      onFocus={(e) => e.target.style.borderColor = T.borderActive}
      onBlur={(e) => e.target.style.borderColor = T.border}
    />
  );
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      onKeyDown={onKeyDown} style={shared}
      onFocus={(e) => e.target.style.borderColor = T.borderActive}
      onBlur={(e) => e.target.style.borderColor = T.border}
    />
  );
};

const Tag = ({ children, onRemove, color = T.blue }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 10px", background: color + "18", color,
    borderRadius: 99, fontSize: 12, fontWeight: 500,
  }}>
    {children}
    {onRemove && (
      <span onClick={onRemove} style={{ cursor: "pointer", opacity: 0.7, fontWeight: 700 }}>×</span>
    )}
  </span>
);

const Section = ({ title, subtitle, children, icon }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.text }}>{title}</h3>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted }}>{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div style={{
    padding: 32, textAlign: "center", color: T.textMuted, fontSize: 13,
    border: `1px dashed ${T.border}`, borderRadius: 10,
  }}>
    <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>{icon}</div>
    {text}
  </div>
);

const ProgressBar = ({ value, max, color = T.green }) => (
  <div style={{ height: 6, background: T.surface, borderRadius: 3, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${Math.min((value / max) * 100, 100)}%`,
      background: `linear-gradient(90deg, ${color}, ${color}aa)`,
      borderRadius: 3, transition: "width .3s ease",
    }} />
  </div>
);

// ============================================================
// TOOL 1: 同义词库构建器 (Synonym Thesaurus Builder)
// ============================================================
function Tool1_SynonymBuilder() {
  const [groups, setGroups] = useState([]);
  const [currentWords, setCurrentWords] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [groupName, setGroupName] = useState("");

  const addWord = () => {
    const w = inputVal.trim();
    if (w && !currentWords.includes(w)) {
      setCurrentWords([...currentWords, w]);
      setInputVal("");
    }
  };

  const saveGroup = () => {
    if (currentWords.length > 0 && groupName.trim()) {
      setGroups([...groups, { id: Date.now(), name: groupName.trim(), words: [...currentWords] }]);
      setCurrentWords([]);
      setGroupName("");
    }
  };

  const removeGroup = (id) => setGroups(groups.filter(g => g.id !== id));
  const removeWord = (i) => setCurrentWords(currentWords.filter((_, j) => j !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：确定目标领域的关键词及其同义词。可来源于导师给出、文献提取、学术翻译网站（如CNKI翻译助手）。注意通配符*可匹配词尾变化（如batter*匹配battery/batteries）。
      </div>

      <Section icon="📝" title="正在编辑的词组" subtitle="先命名词组概念，再添加该概念的所有同义表达">
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Input value={groupName} onChange={e => setGroupName(e.target.value)}
            placeholder="概念名称（如：锌空气电池）" style={{ flex: 1 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Input value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addWord()}
            placeholder="输入同义词后回车（如：Zn-air, zinc-air, zinc air）" style={{ flex: 1 }} />
          <Btn onClick={addWord} disabled={!inputVal.trim()}>添加</Btn>
        </div>
        {currentWords.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {currentWords.map((w, i) => (
              <Tag key={i} onRemove={() => removeWord(i)}>{w}</Tag>
            ))}
          </div>
        )}
        {currentWords.length > 0 && groupName.trim() && (
          <Btn onClick={saveGroup} variant="success" style={{ marginTop: 10, width: "100%" }}>
            ✓ 保存「{groupName}」词组（{currentWords.length}个词）
          </Btn>
        )}
      </Section>

      <Section icon="📚" title={`已建立的同义词组 (${groups.length})`} subtitle="每组代表一个检索概念维度">
        {groups.length === 0 ? (
          <EmptyState icon="📚" text="还没有创建词组。先添加第一个概念的同义词吧！" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {groups.map((g, i) => (
              <div key={g.id} style={{
                padding: 14, background: T.bg, borderRadius: 10,
                border: `1px solid ${T.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge color={T.blue}>组 {i + 1}</Badge>
                    <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{g.name}</span>
                  </div>
                  <span onClick={() => removeGroup(g.id)} style={{ cursor: "pointer", color: T.red, fontSize: 12 }}>删除</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {g.words.map((w, j) => (
                    <Tag key={j} color={T.cyan}>{w}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {groups.length >= 2 && (
        <Section icon="🔎" title="自动生成的检索式" subtitle="可直接复制到Scopus/Web of Science中使用">
          <div style={{
            padding: 16, background: "#071a12", borderRadius: 10,
            border: `1px solid ${T.green}33`, fontFamily: "monospace",
          }}>
            <div style={{ color: T.green, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              TITLE-ABS-KEY 检索式：
            </div>
            <code style={{ color: "#a7f3d0", fontSize: 13, lineHeight: 1.8, wordBreak: "break-all" }}>
              {groups.map(g => `TITLE-ABS-KEY(${g.words.join(" OR ")})`).join("\nAND\n")}
            </code>
            <div style={{ marginTop: 12, color: T.green, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              仅标题检索式：
            </div>
            <code style={{ color: "#a7f3d0", fontSize: 13, lineHeight: 1.8, wordBreak: "break-all" }}>
              {groups.map(g => `TITLE(${g.words.join(" OR ")})`).join("\nAND\n")}
            </code>
          </div>
        </Section>
      )}
    </div>
  );
}

// ============================================================
// TOOL 2: 知识库分组规划器 (Knowledge Base Grouping Planner)
// ============================================================
function Tool2_GroupingPlanner() {
  const [categories, setCategories] = useState([
    { id: 1, name: "不相关", count: 0, color: T.red },
    { id: 2, name: "搜索文献", count: 0, color: T.accent },
    { id: 3, name: "未分类文献", count: 0, color: T.textMuted },
  ]);
  const [subGroups, setSubGroups] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState("");
  const [parentId, setParentId] = useState(null);

  const addCategory = () => {
    if (newCat.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCat.trim(), count: 0, color: T.blue }]);
      setNewCat("");
    }
  };

  const addSubGroup = () => {
    if (newSub.trim() && parentId) {
      setSubGroups([...subGroups, { id: Date.now(), parentId, name: newSub.trim(), count: 0 }]);
      setNewSub("");
    }
  };

  const updateCount = (id, delta, isSub = false) => {
    if (isSub) {
      setSubGroups(subGroups.map(s => s.id === id ? { ...s, count: Math.max(0, s.count + delta) } : s));
    } else {
      setCategories(categories.map(c => c.id === id ? { ...c, count: Math.max(0, c.count + delta) } : c));
    }
  };

  const totalPapers = categories.reduce((a, c) => a + c.count, 0) + subGroups.reduce((a, s) => a + s.count, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：在Endnote中建立分组集合(group set)，先设3个基础组：「不相关」「搜索文献」「未分类文献」。利用Endnote搜索功能批量分组，从未分类中寻找关键词，逐步细化。分组名称会大致反映研究领域的脉络。
      </div>

      <div style={{
        padding: 14, background: T.surface, borderRadius: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: T.textSecondary, fontSize: 13 }}>文献总量</span>
        <span style={{ color: T.text, fontSize: 22, fontWeight: 800 }}>{totalPapers}</span>
      </div>

      <Section icon="📂" title="一级分组" subtitle="用Endnote搜索功能快速分类">
        {categories.map(cat => {
          const subs = subGroups.filter(s => s.parentId === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: 8 }}>
              <div style={{
                padding: "10px 14px", background: T.bg, borderRadius: 8,
                border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 4, height: 28, background: cat.color, borderRadius: 2 }} />
                <span style={{ flex: 1, color: T.text, fontSize: 13, fontWeight: 600 }}>{cat.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span onClick={() => updateCount(cat.id, -1)} style={{
                    cursor: "pointer", width: 24, height: 24, borderRadius: 6,
                    background: T.surface, display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.textMuted, fontSize: 14,
                  }}>−</span>
                  <span style={{ color: T.text, fontSize: 14, fontWeight: 700, minWidth: 30, textAlign: "center" }}>
                    {cat.count}
                  </span>
                  <span onClick={() => updateCount(cat.id, 1)} style={{
                    cursor: "pointer", width: 24, height: 24, borderRadius: 6,
                    background: T.surface, display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.textMuted, fontSize: 14,
                  }}>+</span>
                  <span onClick={() => setParentId(parentId === cat.id ? null : cat.id)}
                    style={{ cursor: "pointer", color: T.blue, fontSize: 11, marginLeft: 8 }}>
                    {parentId === cat.id ? "取消" : "+子组"}
                  </span>
                </div>
              </div>
              {subs.map(sub => (
                <div key={sub.id} style={{
                  padding: "8px 14px 8px 32px", background: T.bg, borderRadius: 6,
                  border: `1px solid ${T.border}`, marginTop: 4, marginLeft: 16,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ flex: 1, color: T.textSecondary, fontSize: 12 }}>↳ {sub.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span onClick={() => updateCount(sub.id, -1, true)} style={{
                      cursor: "pointer", color: T.textMuted, fontSize: 13,
                    }}>−</span>
                    <span style={{ color: T.text, fontSize: 13, fontWeight: 600, minWidth: 24, textAlign: "center" }}>
                      {sub.count}
                    </span>
                    <span onClick={() => updateCount(sub.id, 1, true)} style={{
                      cursor: "pointer", color: T.textMuted, fontSize: 13,
                    }}>+</span>
                  </div>
                </div>
              ))}
              {parentId === cat.id && (
                <div style={{ display: "flex", gap: 6, marginTop: 4, marginLeft: 16 }}>
                  <Input value={newSub} onChange={e => setNewSub(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSubGroup()}
                    placeholder="二级分组名称..." style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} />
                  <Btn onClick={addSubGroup} style={{ padding: "6px 12px", fontSize: 12 }}>添加</Btn>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Input value={newCat} onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCategory()}
            placeholder="新增一级分组（如：catalyst, anode, electrolyte...）" style={{ flex: 1 }} />
          <Btn onClick={addCategory} disabled={!newCat.trim()}>添加分组</Btn>
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// TOOL 3: 文献阅读追踪器 (Literature Reading Tracker)
// ============================================================
function Tool3_ReadingTracker() {
  const [papers, setPapers] = useState([]);
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState("skim");
  const [notes, setNotes] = useState("");

  const stages = {
    skim: { label: "浏览图片", color: T.accent, icon: "👀" },
    read: { label: "选读部分", color: T.blue, icon: "📖" },
    deep: { label: "精读全文", color: T.purple, icon: "🔬" },
    done: { label: "已完成", color: T.green, icon: "✅" },
  };

  const addPaper = () => {
    if (title.trim()) {
      setPapers([...papers, {
        id: Date.now(), title: title.trim(), stage, notes: notes.trim(),
        addedAt: new Date().toLocaleDateString("zh-CN"),
        keyFindings: [],
      }]);
      setTitle(""); setNotes("");
    }
  };

  const cycleStage = (id) => {
    const order = ["skim", "read", "deep", "done"];
    setPapers(papers.map(p => {
      if (p.id !== id) return p;
      const idx = order.indexOf(p.stage);
      return { ...p, stage: order[(idx + 1) % order.length] };
    }));
  };

  const addFinding = (id, text) => {
    if (!text.trim()) return;
    setPapers(papers.map(p => p.id === id ? { ...p, keyFindings: [...p.keyFindings, text.trim()] } : p));
  };

  const removePaper = (id) => setPapers(papers.filter(p => p.id !== id));

  const stats = Object.entries(stages).map(([k, v]) => ({
    ...v, key: k, count: papers.filter(p => p.stage === k).length
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：采用「图片/文字切块-归纳-重组阅读法」。先快速浏览图片获取全貌，再选读感兴趣部分，最后精读代表性文献。问题导向型阅读，不必逐字逐句。
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {stats.map(s => (
          <div key={s.key} style={{
            padding: "10px 12px", background: s.color + "12", borderRadius: 8,
            border: `1px solid ${s.color}33`, textAlign: "center",
          }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ color: s.color, fontSize: 18, fontWeight: 800 }}>{s.count}</div>
            <div style={{ color: s.color, fontSize: 11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Section icon="➕" title="添加文献">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="文献标题或简称..." />
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(stages).map(([k, v]) => (
              <button key={k} onClick={() => setStage(k)} style={{
                flex: 1, padding: "6px 8px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                background: stage === k ? v.color + "22" : T.bg,
                border: `1px solid ${stage === k ? v.color : T.border}`,
                color: stage === k ? v.color : T.textMuted, fontFamily: font,
              }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          <Input value={notes} onChange={e => setNotes(e.target.value)} multiline rows={2}
            placeholder="初步笔记/备注（可选）..." />
          <Btn onClick={addPaper} disabled={!title.trim()} style={{ width: "100%" }}>
            添加到阅读清单
          </Btn>
        </div>
      </Section>

      <Section icon="📋" title={`阅读清单 (${papers.length})`}>
        {papers.length === 0 ? (
          <EmptyState icon="📋" text="阅读清单为空，添加你要阅读的文献吧" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {papers.map(p => {
              const s = stages[p.stage];
              return (
                <PaperCard key={p.id} paper={p} stageInfo={s}
                  onCycleStage={() => cycleStage(p.id)}
                  onAddFinding={(text) => addFinding(p.id, text)}
                  onRemove={() => removePaper(p.id)} />
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

function PaperCard({ paper, stageInfo, onCycleStage, onAddFinding, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [findingInput, setFindingInput] = useState("");

  return (
    <div style={{
      padding: 14, background: T.bg, borderRadius: 10,
      border: `1px solid ${T.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <button onClick={onCycleStage} style={{
          padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12,
          background: stageInfo.color + "18", border: `1px solid ${stageInfo.color}44`,
          color: stageInfo.color, fontFamily: font, fontWeight: 600, flexShrink: 0,
        }}>
          {stageInfo.icon} {stageInfo.label}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            onClick={() => setExpanded(!expanded)}>
            {paper.title}
            <span style={{ color: T.textMuted, fontSize: 11, marginLeft: 8 }}>
              {expanded ? "▲" : "▼"}
            </span>
          </div>
          {paper.notes && (
            <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>{paper.notes}</div>
          )}
        </div>
        <span onClick={onRemove} style={{ cursor: "pointer", color: T.red, fontSize: 11 }}>删除</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
          <div style={{ color: T.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            关键发现/笔记：
          </div>
          {paper.keyFindings.map((f, i) => (
            <div key={i} style={{
              padding: "6px 10px", background: T.surface, borderRadius: 6,
              fontSize: 12, color: T.textSecondary, marginBottom: 4,
              borderLeft: `2px solid ${T.accent}`,
            }}>
              {f}
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <Input value={findingInput} onChange={e => setFindingInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { onAddFinding(findingInput); setFindingInput(""); }
              }}
              placeholder="记录关键发现..." style={{ flex: 1, padding: "6px 10px", fontSize: 12 }} />
            <Btn onClick={() => { onAddFinding(findingInput); setFindingInput(""); }}
              style={{ padding: "6px 12px", fontSize: 12 }}>记录</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TOOL 4: 第一性原理追问器 (First Principles Questioning)
// ============================================================
function Tool4_FirstPrinciples() {
  const [chain, setChain] = useState([{ question: "", answer: "", evidence: "" }]);

  const update = (i, field, val) => {
    const c = [...chain];
    c[i] = { ...c[i], [field]: val };
    setChain(c);
  };

  const addLevel = () => setChain([...chain, { question: "", answer: "", evidence: "" }]);
  const removeLevel = (i) => { if (chain.length > 1) setChain(chain.filter((_, j) => j !== i)); };

  const depthColors = ["#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：确定研究方向的3步——①提出"好"的问题 ②思考背后的原因 ③根据原因提出验证设想。大部分精力往往花在如何提出和描述一个正确的问题上。很多时候越努力反而越找不到解决方式，是因为行驶错了方向。
      </div>

      <div style={{ position: "relative" }}>
        {chain.length > 1 && (
          <div style={{
            position: "absolute", left: 19, top: 20, bottom: 20, width: 2,
            background: `linear-gradient(to bottom, ${depthColors[0]}, ${depthColors[Math.min(chain.length - 1, 5)]})`,
            borderRadius: 1, zIndex: 0,
          }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
          {chain.map((item, i) => {
            const color = depthColors[Math.min(i, 5)];
            return (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: color + "22", border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color, fontSize: 14, fontWeight: 800,
                }}>
                  {i === 0 ? "?" : `W${i}`}
                </div>
                <div style={{
                  flex: 1, padding: 14, background: T.bg, borderRadius: 10,
                  border: `1px solid ${T.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Badge color={color}>{i === 0 ? "🎯 起始问题" : `第${i}层追问`}</Badge>
                    {chain.length > 1 && (
                      <span onClick={() => removeLevel(i)} style={{ cursor: "pointer", color: T.red, fontSize: 11 }}>删除</span>
                    )}
                  </div>
                  <Input value={item.question} onChange={e => update(i, "question", e.target.value)}
                    placeholder={i === 0 ? "你的核心研究问题是什么？" : "为什么？更深层的原因/本质是什么？"}
                    style={{ marginBottom: 6 }} />
                  <Input value={item.answer} onChange={e => update(i, "answer", e.target.value)} multiline rows={2}
                    placeholder="你的思考/推理..." style={{ marginBottom: 6 }} />
                  <Input value={item.evidence} onChange={e => update(i, "evidence", e.target.value)}
                    placeholder="支撑证据/参考文献（可选）"
                    style={{ fontSize: 12, padding: "6px 10px" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Btn onClick={addLevel} variant="ghost" style={{ width: "100%" }}>
        + 继续追问下一层 Why（当前深度：{chain.length}）
      </Btn>

      {chain.length >= 3 && chain[chain.length - 1].answer && (
        <div style={{
          padding: 16, background: "#0a1628", borderRadius: 10,
          border: `1px solid ${T.blue}33`,
        }}>
          <div style={{ color: T.blue, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            🎯 根因分析总结
          </div>
          <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.8 }}>
            从「{chain[0].question || "..."}」出发，经过 {chain.length - 1} 层追问，
            根本原因指向：「{chain[chain.length - 1].answer || "..."}」
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TOOL 5: 实验设计分解器 (Experiment Decomposition)
// ============================================================
function Tool5_ExperimentDesign() {
  const [goal, setGoal] = useState("");
  const [nodes, setNodes] = useState([]);
  const [nodeInput, setNodeInput] = useState("");
  const [desc, setDesc] = useState("");

  const statusMap = {
    pending: { label: "待验证", color: T.textMuted, icon: "⏳", next: "testing" },
    testing: { label: "验证中", color: T.accent, icon: "🔬", next: "pass" },
    pass: { label: "通过", color: T.green, icon: "✅", next: "fail" },
    fail: { label: "有问题", color: T.red, icon: "❌", next: "pending" },
  };

  const addNode = () => {
    if (nodeInput.trim()) {
      setNodes([...nodes, {
        id: Date.now(), text: nodeInput.trim(), desc: desc.trim(),
        status: "pending", notes: "",
      }]);
      setNodeInput(""); setDesc("");
    }
  };

  const cycleStatus = (id) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, status: statusMap[n.status].next } : n));
  };

  const updateNote = (id, note) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, notes: note } : n));
  };

  const removeNode = (id) => setNodes(nodes.filter(n => n.id !== id));

  const passCount = nodes.filter(n => n.status === "pass").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：「以终为始」——先确定终点，一步步倒推，找出最重要的不可或缺的关键节点。先关注0→1（是否可行），再优化1→100（不断优化方案）。用简化法/替换法/排除法快速定位问题。
      </div>

      <Section icon="🎯" title="实验终极目标">
        <Input value={goal} onChange={e => setGoal(e.target.value)}
          placeholder="这个实验最终要达成什么目标？" />
      </Section>

      <Section icon="📍" title="关键验证节点（从终点倒推）" subtitle="每个节点是一个里程碑，点击状态可切换">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Input value={nodeInput} onChange={e => setNodeInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addNode()}
              placeholder="关键节点名称..." style={{ flex: 1 }} />
            <Btn onClick={addNode} disabled={!nodeInput.trim()}>添加</Btn>
          </div>
          <Input value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="节点描述/验证方法（可选）" style={{ fontSize: 12, padding: "6px 10px" }} />
        </div>
      </Section>

      {nodes.length > 0 && (
        <>
          <ProgressBar value={passCount} max={nodes.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {nodes.map((n, i) => {
              const s = statusMap[n.status];
              return (
                <ExperimentNode key={n.id} node={n} index={i} statusInfo={s}
                  total={nodes.length}
                  onCycle={() => cycleStatus(n.id)}
                  onUpdateNote={(note) => updateNote(n.id, note)}
                  onRemove={() => removeNode(n.id)} />
              );
            })}
          </div>
          {goal && (
            <div style={{
              padding: 12, background: T.purpleDim, borderRadius: 10,
              border: `1px solid ${T.purple}44`, textAlign: "center",
            }}>
              <span style={{ color: T.purple, fontSize: 14, fontWeight: 700 }}>
                🎯 终点目标：{goal}
              </span>
              <div style={{ color: T.purple, fontSize: 12, marginTop: 4, opacity: 0.7 }}>
                进度：{passCount}/{nodes.length} 节点已验证通过
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExperimentNode({ node, index, statusInfo, total, onCycle, onUpdateNote, onRemove }) {
  const [showNote, setShowNote] = useState(false);
  return (
    <div style={{
      padding: 12, background: statusInfo.color + "08", borderRadius: 8,
      border: `1px solid ${statusInfo.color}22`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onCycle} style={{
          padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12,
          background: statusInfo.color + "22", border: `1px solid ${statusInfo.color}44`,
          color: statusInfo.color, fontFamily: font, fontWeight: 600, flexShrink: 0,
        }}>
          {statusInfo.icon} {statusInfo.label}
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>
            节点 {total - index}：{node.text}
          </span>
          {node.desc && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{node.desc}</div>}
        </div>
        <span onClick={() => setShowNote(!showNote)} style={{ cursor: "pointer", color: T.textMuted, fontSize: 11 }}>
          📝
        </span>
        <span onClick={onRemove} style={{ cursor: "pointer", color: T.red, fontSize: 11 }}>×</span>
      </div>
      {showNote && (
        <div style={{ marginTop: 8 }}>
          <Input value={node.notes} onChange={e => onUpdateNote(e.target.value)}
            multiline rows={2} placeholder="实验记录/排错笔记..."
            style={{ fontSize: 12 }} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// TOOL 6: 事实vs观点分析器 (Fact vs Opinion Analyzer)
// ============================================================
function Tool6_FactOpinion() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("fact");
  const [source, setSource] = useState("");

  const types = {
    fact: { label: "事实/证据", color: T.blue, icon: "📊", desc: "基于实验数据、测量结果" },
    opinion: { label: "观点/推论", color: T.accent, icon: "💭", desc: "作者的判断、推测、解释" },
    bridge: { label: "逻辑桥梁", color: T.purple, icon: "🌉", desc: "从事实到观点的推导过程" },
    question: { label: "存疑/待验证", color: T.red, icon: "❓", desc: "逻辑不够严密或缺乏证据" },
  };

  const add = () => {
    if (text.trim()) {
      setItems([...items, { id: Date.now(), text: text.trim(), type, source: source.trim() }]);
      setText(""); setSource("");
    }
  };

  const removeItem = (id) => setItems(items.filter(i => i.id !== id));

  const counts = Object.keys(types).reduce((a, k) => ({ ...a, [k]: items.filter(i => i.type === k).length }), {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：阅读文献时，新手容易将作者的观点不假思索地认为是事实。事实和观点之间隔着「逻辑桥梁」，这个桥梁可能是座"断桥"。要区分：实验结果（事实）→ 逻辑推导（桥梁）→ 作者结论（观点）。
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {Object.entries(types).map(([k, v]) => (
          <div key={k} style={{
            padding: "8px 6px", background: v.color + "10", borderRadius: 8,
            border: `1px solid ${v.color}22`, textAlign: "center",
          }}>
            <div style={{ fontSize: 16 }}>{v.icon}</div>
            <div style={{ color: v.color, fontSize: 16, fontWeight: 800 }}>{counts[k] || 0}</div>
            <div style={{ color: v.color, fontSize: 10 }}>{v.label}</div>
          </div>
        ))}
      </div>

      <Section icon="➕" title="分析一条语句">
        <Input value={text} onChange={e => setText(e.target.value)} multiline rows={2}
          placeholder="粘贴论文中的一句关键表述..." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 8 }}>
          {Object.entries(types).map(([k, v]) => (
            <button key={k} onClick={() => setType(k)} style={{
              padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 12,
              background: type === k ? v.color + "22" : T.bg,
              border: `1px solid ${type === k ? v.color : T.border}`,
              color: type === k ? v.color : T.textMuted, fontFamily: font,
              textAlign: "left",
            }}>
              {v.icon} <strong>{v.label}</strong>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{v.desc}</div>
            </button>
          ))}
        </div>
        <Input value={source} onChange={e => setSource(e.target.value)}
          placeholder="来源文献（可选）" style={{ marginTop: 8, fontSize: 12, padding: "6px 10px" }} />
        <Btn onClick={add} disabled={!text.trim()} style={{ marginTop: 8, width: "100%" }}>
          添加分析
        </Btn>
      </Section>

      {items.length > 0 && (
        <Section icon="📋" title="分析结果">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map(item => {
              const t = types[item.type];
              return (
                <div key={item.id} style={{
                  padding: "10px 14px", background: T.bg, borderRadius: 8,
                  borderLeft: `3px solid ${t.color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>{item.text}</div>
                      {item.source && (
                        <div style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>📎 {item.source}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                      <Badge color={t.color}>{t.icon} {t.label}</Badge>
                      <span onClick={() => removeItem(item.id)} style={{ cursor: "pointer", color: T.red, fontSize: 11 }}>×</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

// ============================================================
// TOOL 7: 论文结构规划器 (Paper Structure Planner)
// ============================================================
function Tool7_PaperPlanner() {
  const defaultSections = [
    { id: 1, name: "Introduction", desc: "背景→现状→不足→本文贡献", points: [{ text: "", type: "background" }] },
    { id: 2, name: "Results & Discussion", desc: "实验结果→分析讨论→与文献对比", points: [{ text: "", type: "result" }] },
    { id: 3, name: "Conclusion", desc: "总结贡献→展望未来", points: [{ text: "", type: "conclusion" }] },
  ];

  const [sections, setSections] = useState(defaultSections);
  const [mainThesis, setMainThesis] = useState("");

  const pointTypes = {
    background: { label: "背景", color: T.textMuted },
    gap: { label: "不足/空白", color: T.red },
    contribution: { label: "贡献", color: T.green },
    result: { label: "结果", color: T.blue },
    discussion: { label: "讨论", color: T.purple },
    evidence: { label: "证据", color: T.cyan },
    conclusion: { label: "结论", color: T.accent },
  };

  const updatePoint = (si, pi, field, val) => {
    const ns = [...sections];
    ns[si].points[pi] = { ...ns[si].points[pi], [field]: val };
    setSections(ns);
  };

  const addPoint = (si) => {
    const ns = [...sections];
    ns[si].points.push({ text: "", type: "result" });
    setSections(ns);
  };

  const removePoint = (si, pi) => {
    const ns = [...sections];
    if (ns[si].points.length > 1) ns[si].points.splice(pi, 1);
    setSections(ns);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：研究结果就相当于一个个起点，每个起点通过桥梁（逻辑表达）连接到一个观点，多个分观点串联/并联最终支撑全文主旨。连接研究结果和观点之间的桥梁一定要可靠存在。
      </div>

      <Section icon="🌳" title="全文主旨（树冠）">
        <Input value={mainThesis} onChange={e => setMainThesis(e.target.value)}
          placeholder="本文的核心贡献/主旨是什么？（一句话概括）" />
      </Section>

      {sections.map((sec, si) => (
        <div key={sec.id} style={{
          padding: 16, background: T.bg, borderRadius: 12,
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ marginBottom: 12 }}>
            <h4 style={{ margin: 0, color: T.text, fontSize: 15, fontWeight: 700 }}>{sec.name}</h4>
            <span style={{ color: T.textMuted, fontSize: 12 }}>{sec.desc}</span>
          </div>

          {sec.points.map((pt, pi) => (
            <div key={pi} style={{
              display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start",
            }}>
              <select value={pt.type} onChange={e => updatePoint(si, pi, "type", e.target.value)}
                style={{
                  padding: "8px 6px", background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 6, color: pointTypes[pt.type]?.color || T.text, fontSize: 12,
                  fontFamily: font, outline: "none", cursor: "pointer", flexShrink: 0,
                }}>
                {Object.entries(pointTypes).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <Input value={pt.text} onChange={e => updatePoint(si, pi, "text", e.target.value)}
                placeholder="这一段要表达的核心要点..." style={{ flex: 1 }} />
              {sec.points.length > 1 && (
                <span onClick={() => removePoint(si, pi)}
                  style={{ cursor: "pointer", color: T.red, fontSize: 14, padding: "8px 4px" }}>×</span>
              )}
            </div>
          ))}

          <Btn onClick={() => addPoint(si)} variant="ghost"
            style={{ width: "100%", marginTop: 4, padding: "6px" }}>
            + 添加要点
          </Btn>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// TOOL 8: 论文自查清单 (Paper Checklist)
// ============================================================
function Tool8_Checklist() {
  const allCategories = [
    {
      name: "1.1 前言-第1部分", icon: "📖", items: [
        "研究背景/领域介绍是否清晰？",
        "现有研究现状是否充分介绍？",
        "是否引用了领域代表性文献？",
        "背景介绍是否与本文主题紧密相关？",
      ]
    },
    {
      name: "1.2 前言-第2部分", icon: "🎯", items: [
        "现有研究的不足/空白是否明确指出？",
        "本文要解决的问题是否清晰？",
        "本文的贡献/创新点是否突出？",
        "从背景到问题到方案的逻辑是否连贯？",
        "是否避免了在未给出证据前就下结论？",
      ]
    },
    {
      name: "2. 结果与讨论", icon: "📊", items: [
        "每个观点是否有实验证据支撑？",
        "数据到结论的逻辑推导是否严谨？",
        "是否与已有文献进行了横向对比？",
        "是否有纵向深入的机理讨论？",
        "结论是否存在过度推断？",
        "SEM表征是否用了不恰当的描述（如strong）？",
        "数据是否与已有文献/商业材料进行了对比？",
      ]
    },
    {
      name: "3. 表达类", icon: "✏️", items: [
        "是否存在中式英语表达？",
        "时态使用是否正确且统一？",
        "单复数/冠词使用是否正确？",
        "专业术语前后是否一致？",
        "句子是否过长需要拆分？",
        "拼写是否已用Grammarly等工具检查？",
      ]
    },
    {
      name: "4. 引用文献", icon: "📎", items: [
        "引用的文献是否确实支持所述观点？",
        "引用的文献是否为一手文献而非二手转引？",
        "参考文献列表格式是否统一规范？",
        "作者姓名、卷期号、页码是否正确？",
        "是否有遗漏的重要参考文献？",
      ]
    },
    {
      name: "5. 格式类", icon: "📐", items: [
        "图片中(a)(b)等标记格式是否统一？",
        "化学式上下标是否全部正确？",
        "不同段落行距/间距是否一致？",
        "图片分辨率是否达到期刊要求？",
        "图注/表注描述是否完整准确？",
        "补充材料中是否也检查了同类错误？",
      ]
    },
  ];

  const [checked, setChecked] = useState({});
  const [activeCategory, setActiveCategory] = useState(0);

  const toggle = (key) => setChecked({ ...checked, [key]: !checked[key] });

  const totalAll = allCategories.reduce((a, c) => a + c.items.length, 0);
  const doneAll = Object.values(checked).filter(Boolean).length;

  const cat = allCategories[activeCategory];
  const catDone = cat.items.filter((_, i) => checked[`${activeCategory}-${i}`]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：每次只检查一种类型的错误（如同流水线），不要试图一次性找出所有问题。检查一种类型后打勾，再切换到下一种类型。举一反三——发现一处错误，思考其他地方是否有同类错误。
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: T.textSecondary, fontSize: 13 }}>总进度</span>
        <span style={{ color: T.green, fontSize: 14, fontWeight: 700 }}>{doneAll}/{totalAll}</span>
      </div>
      <ProgressBar value={doneAll} max={totalAll} />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {allCategories.map((c, i) => {
          const catTotal = c.items.length;
          const catChecked = c.items.filter((_, j) => checked[`${i}-${j}`]).length;
          const isComplete = catChecked === catTotal;
          return (
            <button key={i} onClick={() => setActiveCategory(i)} style={{
              padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12,
              background: activeCategory === i ? T.blue + "22" : (isComplete ? T.greenDim : T.bg),
              border: `1px solid ${activeCategory === i ? T.blue : (isComplete ? T.green + "44" : T.border)}`,
              color: activeCategory === i ? T.blue : (isComplete ? T.green : T.textSecondary),
              fontFamily: font, fontWeight: activeCategory === i ? 600 : 400,
            }}>
              {c.icon} {catChecked}/{catTotal}
            </button>
          );
        })}
      </div>

      <div style={{
        padding: 16, background: T.bg, borderRadius: 12,
        border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ margin: 0, color: T.text, fontSize: 15, fontWeight: 700 }}>
            {cat.icon} {cat.name}
          </h4>
          <Badge color={catDone === cat.items.length ? T.green : T.textMuted}>
            {catDone}/{cat.items.length}
          </Badge>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {cat.items.map((item, i) => {
            const key = `${activeCategory}-${i}`;
            const done = checked[key];
            return (
              <div key={i} onClick={() => toggle(key)} style={{
                padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                background: done ? T.greenDim : T.surface,
                border: `1px solid ${done ? T.green + "33" : "transparent"}`,
                display: "flex", alignItems: "center", gap: 10,
                transition: "all .15s",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  background: done ? T.green : "transparent",
                  border: done ? "none" : `2px solid ${T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  transition: "all .15s",
                }}>
                  {done ? "✓" : ""}
                </div>
                <span style={{
                  color: done ? T.green : T.text, fontSize: 13,
                  textDecoration: done ? "line-through" : "none",
                  opacity: done ? 0.7 : 1,
                }}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TOOL 9: Perspective/Review写作规划器
// ============================================================
function Tool9_ReviewPlanner() {
  const [steps, setSteps] = useState([
    { id: 1, name: "确定检索词库", status: "todo", notes: "", details: "根据主题确定关键词、同义词、相近词" },
    { id: 2, name: "构造检索式并测试", status: "todo", notes: "", details: "在Scopus等数据库测试，调整检索结果数量和相关性" },
    { id: 3, name: "文献导入Endnote", status: "todo", notes: "", details: "批量导入，去重，记录检索式和时间" },
    { id: 4, name: "二次搜索和分组归纳", status: "todo", notes: "", details: "利用Endnote搜索功能快速批量分类" },
    { id: 5, name: "初步论文提纲", status: "todo", notes: "", details: "以论文小标题形式给出大纲，源于分组启发" },
    { id: 6, name: "搜集和提炼素材", status: "todo", notes: "", details: "针对每个小标题搜集写作素材" },
    { id: 7, name: "完成全文写作", status: "todo", notes: "", details: "根据提纲和素材完成写作" },
  ]);

  const [outline, setOutline] = useState("");

  const statusCycle = { todo: "doing", doing: "done", done: "todo" };
  const statusStyle = {
    todo: { label: "待开始", color: T.textMuted, icon: "○" },
    doing: { label: "进行中", color: T.accent, icon: "◉" },
    done: { label: "完成", color: T.green, icon: "●" },
  };

  const cycleStep = (id) => {
    setSteps(steps.map(s => s.id === id ? { ...s, status: statusCycle[s.status] } : s));
  };

  const updateNote = (id, notes) => {
    setSteps(steps.map(s => s.id === id ? { ...s, notes } : s));
  };

  const doneCount = steps.filter(s => s.status === "done").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        padding: 16, background: T.accentDim, borderRadius: 10,
        border: `1px solid ${T.accent}33`, fontSize: 13, color: T.accent, lineHeight: 1.6,
      }}>
        💡 <strong>方法论</strong>：Perspective/Review写作也涉及完善知识库、确定框架、将框架扩充丰满。从检索词库→检索式→Endnote整理→分组归纳→提纲→素材→全文，逐步推进。
      </div>

      <ProgressBar value={doneCount} max={steps.length} color={T.accent} />

      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 15, top: 10, bottom: 10, width: 2,
          background: T.border, zIndex: 0,
        }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
          {steps.map((step, i) => {
            const ss = statusStyle[step.status];
            return (
              <ReviewStep key={step.id} step={step} index={i} statusInfo={ss}
                onCycle={() => cycleStep(step.id)}
                onUpdateNote={(n) => updateNote(step.id, n)} />
            );
          })}
        </div>
      </div>

      <Section icon="📝" title="论文提纲" subtitle="在第5步形成，可随写作不断完善">
        <Input value={outline} onChange={e => setOutline(e.target.value)}
          multiline rows={8}
          placeholder={`1. Introduction\n  1.1 背景概述\n  1.2 现有研究分类\n2. 主题分类一\n  2.1 ...\n3. 挑战与展望\n4. Conclusion`} />
      </Section>
    </div>
  );
}

function ReviewStep({ step, index, statusInfo, onCycle, onUpdateNote }) {
  const [showNote, setShowNote] = useState(false);
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div onClick={onCycle} style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
        background: statusInfo.color + "22", border: `2px solid ${statusInfo.color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: statusInfo.color, fontSize: 14, fontWeight: 800,
        transition: "all .15s",
      }}>
        {step.status === "done" ? "✓" : index + 1}
      </div>
      <div style={{
        flex: 1, padding: 12, background: T.bg, borderRadius: 8,
        border: `1px solid ${step.status === "doing" ? statusInfo.color + "44" : T.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{
              color: step.status === "done" ? T.green : T.text,
              fontSize: 13, fontWeight: 600,
              textDecoration: step.status === "done" ? "line-through" : "none",
            }}>
              {step.name}
            </span>
            <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{step.details}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
            <span onClick={() => setShowNote(!showNote)} style={{
              cursor: "pointer", color: T.textMuted, fontSize: 12,
            }}>📝</span>
          </div>
        </div>
        {showNote && (
          <div style={{ marginTop: 8 }}>
            <Input value={step.notes} onChange={e => onUpdateNote(e.target.value)}
              multiline rows={2} placeholder="备注/进展记录..."
              style={{ fontSize: 12 }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
const ALL_TOOLS = [
  { id: "synonym", name: "同义词库构建器", icon: "📚", desc: "构建检索关键词同义词库并自动生成检索式", phase: "选题", component: Tool1_SynonymBuilder },
  { id: "grouping", name: "知识库分组规划器", icon: "📂", desc: "规划Endnote分组策略，追踪文献分类", phase: "选题", component: Tool2_GroupingPlanner },
  { id: "reading", name: "文献阅读追踪器", icon: "📋", desc: "跟踪文献阅读进度，记录关键发现", phase: "文献", component: Tool3_ReadingTracker },
  { id: "firstprinciple", name: "第一性原理追问器", icon: "🎯", desc: "连续追问Why，触及问题根本原因", phase: "研究", component: Tool4_FirstPrinciples },
  { id: "experiment", name: "实验设计分解器", icon: "🧪", desc: "以终为始分解实验为关键验证节点", phase: "研究", component: Tool5_ExperimentDesign },
  { id: "factopinion", name: "事实vs观点分析器", icon: "⚖️", desc: "区分论文中的事实、观点和逻辑桥梁", phase: "写作", component: Tool6_FactOpinion },
  { id: "planner", name: "论文结构规划器", icon: "📝", desc: "规划论文各部分的逻辑流和证据链", phase: "写作", component: Tool7_PaperPlanner },
  { id: "checklist", name: "论文自查清单", icon: "✅", desc: "分类型逐项检查论文常见问题", phase: "自查", component: Tool8_Checklist },
  { id: "review", name: "综述写作规划器", icon: "📑", desc: "Perspective/Review类论文全流程管理", phase: "写作", component: Tool9_ReviewPlanner },
];

export default function App() {
  const [activeTool, setActiveTool] = useState(null);

  const phases = ["选题", "文献", "研究", "写作", "自查"];
  const phaseColors = { "选题": T.blue, "文献": T.cyan, "研究": T.purple, "写作": T.accent, "自查": T.green };

  if (activeTool) {
    const tool = ALL_TOOLS.find(t => t.id === activeTool);
    const Comp = tool.component;
    return (
      <div style={{
        minHeight: "100vh", background: T.bg, fontFamily: font, color: T.text,
      }}>
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${T.border}`,
          background: T.card, display: "flex", alignItems: "center", gap: 12,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <button onClick={() => setActiveTool(null)} style={{
            padding: "6px 14px", background: T.surface, color: T.textSecondary,
            border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer",
            fontSize: 13, fontFamily: font,
          }}>← 返回</button>
          <span style={{ fontSize: 22 }}>{tool.icon}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{tool.name}</h2>
            <p style={{ margin: 0, fontSize: 12, color: T.textMuted }}>{tool.desc}</p>
          </div>
          <Badge color={phaseColors[tool.phase]} style={{ marginLeft: "auto" }}>{tool.phase}阶段</Badge>
        </div>
        <div style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
          <Comp />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, fontFamily: font, color: T.text,
    }}>
      {/* Hero */}
      <div style={{
        padding: "32px 24px 24px", textAlign: "center",
        background: `linear-gradient(180deg, ${T.card} 0%, ${T.bg} 100%)`,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔬</div>
        <h1 style={{
          margin: "0 0 6px", fontSize: 26, fontWeight: 900,
          background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          科研方法论工具箱
        </h1>
        <p style={{ margin: 0, color: T.textMuted, fontSize: 14 }}>
          基于《科学研究与论文写作》· 9个实用工具覆盖科研全流程
        </p>

        {/* Phase Flow */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, marginTop: 20, flexWrap: "wrap",
        }}>
          {phases.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                padding: "6px 16px", borderRadius: 20,
                background: phaseColors[p] + "18",
                border: `1px solid ${phaseColors[p]}44`,
                color: phaseColors[p], fontSize: 13, fontWeight: 600,
              }}>
                {p}
              </div>
              {i < phases.length - 1 && (
                <span style={{ color: T.border, fontSize: 16 }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tool Grid */}
      <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        {phases.map(phase => {
          const tools = ALL_TOOLS.filter(t => t.phase === phase);
          return (
            <div key={phase} style={{ marginBottom: 24 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              }}>
                <div style={{
                  width: 3, height: 18, borderRadius: 2,
                  background: phaseColors[phase],
                }} />
                <span style={{ color: phaseColors[phase], fontSize: 14, fontWeight: 700 }}>
                  {phase}阶段
                </span>
                <span style={{ color: T.textMuted, fontSize: 12 }}>
                  {tools.length} 个工具
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {tools.map(tool => (
                  <div key={tool.id} onClick={() => setActiveTool(tool.id)}
                    style={{
                      padding: 16, background: T.card, borderRadius: 12,
                      border: `1px solid ${T.border}`, cursor: "pointer",
                      transition: "all .2s", display: "flex", gap: 14, alignItems: "flex-start",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = phaseColors[phase];
                      e.currentTarget.style.background = T.cardHover;
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.background = T.card;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: phaseColors[phase] + "12",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, flexShrink: 0,
                    }}>
                      {tool.icon}
                    </div>
                    <div>
                      <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>
                        {tool.name}
                      </div>
                      <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                        {tool.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
