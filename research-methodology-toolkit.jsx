import { useState, useEffect, useRef } from "react";

const PHASES = [
  {
    id: "mindset",
    icon: "🧠",
    title: "第一章 · 思维基石",
    subtitle: "科学探索的本质",
    color: "#1a1a2e",
    accent: "#e94560",
    points: [
      {
        key: "科学探索 = 生活方式",
        detail: "科学探索本质上是拓展对世界（包括自身）认知的过程，是一种生活方式和思维方式，而非仅限于学术机构。",
      },
      {
        key: "好奇心驱动",
        detail: "人类天生对未知事物有探索欲和创造欲，科学探索源于对未知事物的吸引。",
      },
      {
        key: "三类认知拓展",
        detail: "①探索全新未知领域 ②在有争议领域验证/修正 ③修正已有定论中的错误。三者相互关联。",
      },
      {
        key: "发现与成长观",
        detail: "没有所谓的失败实验，一切都是收获。不以对错评价，而以发现和成长看待。",
      },
      {
        key: "拥抱新事物",
        detail: "未知的、不了解的，才是"正常"的状态。要克服畏惧心理，用发现新事物的欣喜替代恐惧。",
      },
    ],
  },
  {
    id: "topic",
    icon: "🔍",
    title: "第二章 · 选题",
    subtitle: "从知识库到研究方向",
    color: "#16213e",
    accent: "#0f3460",
    points: [
      {
        key: "选题-研究-总结 非线性循环",
        detail: "三个过程相互影响，可随时回溯调整。研究阶段发现选题有误时需重新修正。",
      },
      {
        key: "选题四步法",
        detail: "①构造同义词库 → ②构造检索式 → ③建立知识库 → ④更新完善知识库",
        tool: "synonym",
      },
      {
        key: "同义词库构造",
        detail: "确定目标领域关键词及同义词、相近词。利用学术翻译网站（如CNKI翻译）获取专有名词的学术表达。",
        tool: "synonym",
      },
      {
        key: "检索式构造",
        detail: "使用AND/OR/NOT逻辑组合关键词，通配符*匹配变形。在Scopus/WoS等数据库中搜索。",
        tool: "search",
      },
      {
        key: "知识库管理（Endnote）",
        detail: "批量导入→搜索功能快速分组→逐篇浏览去除不相关→二次分组细化→形成领域全景图。",
        tool: "grouping",
      },
    ],
  },
  {
    id: "reading",
    icon: "📖",
    title: "第二章 · 文献阅读",
    subtitle: "图片/文字切块-归纳-重组阅读法",
    color: "#1a1a2e",
    accent: "#e94560",
    points: [
      {
        key: "问题导向型阅读",
        detail: "不按全文顺序浏览，而是只阅读感兴趣的部分。根据研究阶段选择性关注不同内容。",
      },
      {
        key: "图片优先浏览",
        detail: "通过快速浏览文献中图片(Figures)代替逐字逐句阅读。图片信息接受速度远高于文字。",
        tool: "reading",
      },
      {
        key: "切块-归纳-重组",
        detail: "将图片提取到文档中按类归纳→浏览同类图片获取共性→形成2号文档归纳整理→反复迭代。",
        tool: "reading",
      },
      {
        key: "精读+文献跟踪",
        detail: "精读代表性文献需同步进行研究实践。设置检索式提醒功能，增量更新知识库。",
      },
      {
        key: "源头思维",
        detail: "阅读过程中追根问底，从源头基本原理出发，思考作者观点是否有足够依据。区分事实与观点。",
        tool: "factcheck",
      },
    ],
  },
  {
    id: "research",
    icon: "🔬",
    title: "第三章 · 研究",
    subtitle: "实验设计与开展",
    color: "#0f3460",
    accent: "#53d8fb",
    points: [
      {
        key: "追根问底的思维方式",
        detail: "不断追问"为什么"，从问题到原因，从原因到验证设想。三步：提出好问题→思考原因→提出验证设想。",
        tool: "firstprinciple",
      },
      {
        key: "以终为始的实验设计",
        detail: "简化法/替换法/排除法/节点测试法。将复杂实验分割为关键节点，逐步缩小问题范围。",
        tool: "experiment",
      },
      {
        key: "极致的分解",
        detail: "将无法分解的细节也尝试分解。很多问题源于习以为常的被忽略之处。用质疑精神审视每一步。",
      },
      {
        key: "0到1阶段：快速验证idea",
        detail: "基于'以终为始'，先关注可行性(0→1)，再优化方案(1→100)。优先做极端条件下的测试。",
        tool: "experiment",
      },
      {
        key: "实验习惯",
        detail: "①详细记录实验步骤和条件 ②样品编号关联实验记录 ③保存所有样品（含失败的）④视频+录音记录。",
      },
    ],
  },
  {
    id: "writing",
    icon: "✍️",
    title: "第四章 · 写作",
    subtitle: "从知识库到素材库到论文",
    color: "#1a1a2e",
    accent: "#e94560",
    points: [
      {
        key: "核心写作原则",
        detail: "依托事实/证据(fact/evidence)，通过合理逻辑(logic flow)，阐明观点(opinion)和贡献(contribution)。",
        tool: "writing",
      },
      {
        key: "区分观点与事实",
        detail: "每个观点需有证据支撑，逻辑推导需严谨。事实与观点之间的桥梁（逻辑表达）必须可靠。",
        tool: "factcheck",
      },
      {
        key: "从知识库到素材库",
        detail: "①明确贡献→论文框架 ②搜集-归纳-提炼素材 ③形成文字。类似蜜蜂采蜜过程。",
      },
      {
        key: "横向与纵向扩展讨论",
        detail: "横向：与文献/标准体系对比。纵向：深入探讨本质原因、追根问底。自上而下+自下而上检索。",
      },
      {
        key: "Perspective/Review写作",
        detail: "确定检索词库→构造检索式→Endnote文献整理→初步提纲→完成全文。",
        tool: "writing",
      },
    ],
  },
  {
    id: "checklist",
    icon: "✅",
    title: "第五章 · 自查",
    subtitle: "Checklist写作常见问题",
    color: "#16213e",
    accent: "#0f3460",
    points: [
      {
        key: "每次只检查一种类型",
        detail: "不要试图一次性检查出所有错误。每次聚焦一种错误类型，如同流水线分工。",
        tool: "checklist",
      },
      {
        key: "写作类检查",
        detail: "前言逻辑、结果与讨论深度、观点证据匹配、逻辑连贯性。",
        tool: "checklist",
      },
      {
        key: "格式类检查",
        detail: "图片标记、上下标、段落间距、参考文献格式、拼写语法。",
        tool: "checklist",
      },
      {
        key: "证据类检查",
        detail: "引用文献准确性、原始数据完整性、实验可重复性。",
        tool: "checklist",
      },
      {
        key: "举一反三",
        detail: "发现一处错误后，思考同类错误是否出现在其他地方（标题、关键词、摘要、补充材料等）。",
      },
    ],
  },
];

const TOOLS = {
  synonym: {
    name: "同义词库构建器",
    icon: "📚",
    description: "帮助构建研究领域的同义词库，生成检索关键词",
  },
  search: {
    name: "检索式生成器",
    icon: "🔎",
    description: "根据同义词库自动组合AND/OR逻辑检索式",
  },
  grouping: {
    name: "文献分组规划器",
    icon: "📂",
    description: "规划Endnote分组策略，追踪分类进度",
  },
  reading: {
    name: "文献阅读追踪器",
    icon: "📋",
    description: "跟踪文献阅读进度，记录关键图片和笔记",
  },
  factcheck: {
    name: "事实vs观点分析器",
    icon: "⚖️",
    description: "帮助区分论文中的事实陈述和观点推论",
  },
  firstprinciple: {
    name: "第一性原理追问器",
    icon: "🎯",
    description: "通过连续追问Why引导深入思考问题本质",
  },
  experiment: {
    name: "实验设计分解器",
    icon: "🧪",
    description: "将实验方案分解为可验证的关键节点",
  },
  writing: {
    name: "论文结构规划器",
    icon: "📝",
    description: "规划论文各部分的逻辑流和证据链",
  },
  checklist: {
    name: "论文自查清单",
    icon: "✅",
    description: "分类型逐项检查论文常见问题",
  },
};

// ========== Tool Components ==========

function SynonymTool() {
  const [keyword, setKeyword] = useState("");
  const [synonyms, setSynonyms] = useState([]);
  const [groups, setGroups] = useState([]);

  const addSynonym = () => {
    if (keyword.trim()) {
      setSynonyms([...synonyms, keyword.trim()]);
      setKeyword("");
    }
  };

  const createGroup = () => {
    if (synonyms.length > 0) {
      setGroups([...groups, { id: Date.now(), words: [...synonyms] }]);
      setSynonyms([]);
    }
  };

  const generateSearchQuery = () => {
    if (groups.length === 0) return "";
    return groups
      .map((g) => `(${g.words.join(" OR ")})`)
      .join(" AND ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        为每组概念添加同义词/相近词，然后生成检索式
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSynonym()}
          placeholder="输入同义词/关键词..."
          style={{
            flex: 1, padding: "10px 14px", background: "#1e293b",
            border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0",
            fontSize: 14, outline: "none",
          }}
        />
        <button onClick={addSynonym} style={{
          padding: "10px 16px", background: "#3b82f6", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}>添加</button>
      </div>

      {synonyms.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>当前组：</span>
          {synonyms.map((s, i) => (
            <span key={i} style={{
              padding: "4px 10px", background: "#1e3a5f", color: "#93c5fd",
              borderRadius: 12, fontSize: 13,
            }}>
              {s}
              <span onClick={() => setSynonyms(synonyms.filter((_, j) => j !== i))}
                style={{ marginLeft: 6, cursor: "pointer", color: "#ef4444" }}>×</span>
            </span>
          ))}
          <button onClick={createGroup} style={{
            padding: "4px 12px", background: "#059669", color: "#fff",
            border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13,
          }}>✓ 完成此组</button>
        </div>
      )}

      {groups.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>已建立的同义词组：</span>
          {groups.map((g, i) => (
            <div key={g.id} style={{
              padding: "8px 12px", background: "#0f172a", borderRadius: 8,
              border: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#e2e8f0", fontSize: 13 }}>
                组{i + 1}：{g.words.join(" OR ")}
              </span>
              <span onClick={() => setGroups(groups.filter((_, j) => j !== i))}
                style={{ cursor: "pointer", color: "#ef4444", fontSize: 12 }}>删除</span>
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <div style={{
          padding: 14, background: "#022c22", borderRadius: 10,
          border: "1px solid #065f46",
        }}>
          <div style={{ color: "#34d399", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            生成的检索式：
          </div>
          <code style={{ color: "#a7f3d0", fontSize: 13, wordBreak: "break-all" }}>
            {generateSearchQuery()}
          </code>
        </div>
      )}
    </div>
  );
}

function FirstPrincipleTool() {
  const [questions, setQuestions] = useState([{ q: "", a: "" }]);

  const update = (i, field, val) => {
    const nq = [...questions];
    nq[i][field] = val;
    setQuestions(nq);
  };

  const addLevel = () => {
    setQuestions([...questions, { q: "", a: "" }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        从你的研究问题开始，不断追问"为什么"，直到触及根本原因
      </p>
      {questions.map((item, i) => (
        <div key={i} style={{
          padding: 12, background: "#0f172a", borderRadius: 10,
          borderLeft: `3px solid ${i === 0 ? "#f59e0b" : "#3b82f6"}`,
        }}>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>
            {i === 0 ? "🎯 起始问题" : `第 ${i} 层追问 — 为什么？`}
          </div>
          <input value={item.q} onChange={(e) => update(i, "q", e.target.value)}
            placeholder={i === 0 ? "你要研究的核心问题是什么？" : "为什么会这样？更深层的原因是？"}
            style={{
              width: "100%", padding: "8px 10px", background: "#1e293b",
              border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0",
              fontSize: 13, outline: "none", marginBottom: 6, boxSizing: "border-box",
            }}
          />
          <textarea value={item.a} onChange={(e) => update(i, "a", e.target.value)}
            placeholder="你的思考/答案..."
            rows={2}
            style={{
              width: "100%", padding: "8px 10px", background: "#1e293b",
              border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0",
              fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>
      ))}
      <button onClick={addLevel} style={{
        padding: "8px 14px", background: "#1e293b", color: "#93c5fd",
        border: "1px dashed #3b82f6", borderRadius: 8, cursor: "pointer", fontSize: 13,
      }}>+ 继续追问下一层 Why</button>
    </div>
  );
}

function ExperimentTool() {
  const [goal, setGoal] = useState("");
  const [nodes, setNodes] = useState([]);
  const [nodeText, setNodeText] = useState("");

  const addNode = () => {
    if (nodeText.trim()) {
      setNodes([...nodes, { text: nodeText.trim(), status: "pending" }]);
      setNodeText("");
    }
  };

  const toggleStatus = (i) => {
    const nn = [...nodes];
    const cycle = { pending: "pass", pass: "fail", fail: "pending" };
    nn[i].status = cycle[nn[i].status];
    setNodes(nn);
  };

  const statusStyles = {
    pending: { bg: "#1e293b", color: "#94a3b8", label: "⏳ 待验证" },
    pass: { bg: "#022c22", color: "#34d399", label: "✅ 通过" },
    fail: { bg: "#2d0a0a", color: "#f87171", label: "❌ 问题" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        设定实验目标，分解为关键节点（里程碑），逐一验证
      </p>
      <input value={goal} onChange={(e) => setGoal(e.target.value)}
        placeholder="实验最终目标（终点）..."
        style={{
          padding: "10px 14px", background: "#1e293b",
          border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0",
          fontSize: 14, outline: "none",
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <input value={nodeText} onChange={(e) => setNodeText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNode()}
          placeholder="添加关键验证节点（从终点倒推）..."
          style={{
            flex: 1, padding: "10px 14px", background: "#1e293b",
            border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0",
            fontSize: 14, outline: "none",
          }}
        />
        <button onClick={addNode} style={{
          padding: "10px 16px", background: "#8b5cf6", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
        }}>添加</button>
      </div>

      {nodes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {nodes.map((n, i) => {
            const s = statusStyles[n.status];
            return (
              <div key={i} onClick={() => toggleStatus(i)} style={{
                padding: "10px 14px", background: s.bg, borderRadius: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", border: "1px solid #1e293b",
                transition: "all 0.2s",
              }}>
                <span style={{ color: s.color, fontSize: 13 }}>
                  节点 {i + 1}：{n.text}
                </span>
                <span style={{ fontSize: 12, color: s.color }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {goal && (
        <div style={{
          padding: 10, background: "#1a0a2e", borderRadius: 8,
          border: "1px solid #7c3aed", textAlign: "center",
        }}>
          <span style={{ color: "#c4b5fd", fontSize: 13 }}>🎯 终点：{goal}</span>
        </div>
      )}
    </div>
  );
}

function ChecklistTool() {
  const categories = [
    {
      name: "1. 前言逻辑",
      items: [
        "研究背景是否清晰？",
        "现有研究的不足是否明确？",
        "本文贡献/创新点是否突出？",
        "从背景到问题到方案的逻辑是否连贯？",
        "引用文献是否支撑观点？",
      ],
    },
    {
      name: "2. 结果与讨论",
      items: [
        "每个观点是否有实验证据支撑？",
        "逻辑推导是否严谨（事实→观点桥梁可靠）？",
        "是否与已有文献进行了对比讨论？",
        "讨论深度是否足够（横向+纵向）？",
        "结论是否过度推断？",
      ],
    },
    {
      name: "3. 表达类",
      items: [
        "是否存在中式英语表达？",
        "时态使用是否正确？",
        "单复数使用是否一致？",
        "专业术语是否统一？",
        "句子是否过长/难以理解？",
      ],
    },
    {
      name: "4. 格式类",
      items: [
        "图片(a)(b)等标记是否一致？",
        "上下标是否正确？",
        "段落间距/行距是否统一？",
        "参考文献格式是否规范？",
        "图片分辨率是否达标？",
      ],
    },
  ];

  const [checked, setChecked] = useState({});

  const toggle = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setChecked({ ...checked, [key]: !checked[key] });
  };

  const total = categories.reduce((a, c) => a + c.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
          每次只聚焦一个类型进行检查
        </p>
        <span style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>
          {done}/{total} 已检查
        </span>
      </div>
      <div style={{
        height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${(done / total) * 100}%`,
          background: "linear-gradient(90deg, #3b82f6, #34d399)",
          borderRadius: 2, transition: "width 0.3s",
        }} />
      </div>
      {categories.map((cat, ci) => (
        <div key={ci}>
          <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            {cat.name}
          </div>
          {cat.items.map((item, ii) => {
            const key = `${ci}-${ii}`;
            const isChecked = checked[key];
            return (
              <div key={ii} onClick={() => toggle(ci, ii)} style={{
                padding: "8px 12px", marginBottom: 3, borderRadius: 6,
                background: isChecked ? "#022c22" : "#0f172a",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s",
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 12,
                  background: isChecked ? "#059669" : "#1e293b",
                  border: isChecked ? "none" : "1px solid #334155",
                  color: "#fff", flexShrink: 0,
                }}>
                  {isChecked ? "✓" : ""}
                </span>
                <span style={{
                  color: isChecked ? "#6ee7b7" : "#cbd5e1", fontSize: 13,
                  textDecoration: isChecked ? "line-through" : "none",
                }}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function FactCheckTool() {
  const [statements, setStatements] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState("fact");

  const add = () => {
    if (text.trim()) {
      setStatements([...statements, { text: text.trim(), type }]);
      setText("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        将论文中的关键句子分类为"事实"或"观点"，检查逻辑桥梁是否可靠
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        placeholder="粘贴论文中的一句关键表述..."
        rows={2}
        style={{
          width: "100%", padding: "10px 14px", background: "#1e293b",
          border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0",
          fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { v: "fact", label: "📊 事实/证据", c: "#3b82f6" },
          { v: "opinion", label: "💭 观点/推论", c: "#f59e0b" },
          { v: "bridge", label: "🌉 逻辑桥梁", c: "#8b5cf6" },
        ].map((opt) => (
          <button key={opt.v} onClick={() => setType(opt.v)} style={{
            padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12,
            background: type === opt.v ? opt.c + "22" : "#0f172a",
            border: `1px solid ${type === opt.v ? opt.c : "#1e293b"}`,
            color: type === opt.v ? opt.c : "#64748b",
          }}>
            {opt.label}
          </button>
        ))}
        <button onClick={add} style={{
          marginLeft: "auto", padding: "6px 14px", background: "#3b82f6",
          color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
        }}>添加</button>
      </div>
      {statements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {statements.map((s, i) => {
            const colors = { fact: "#3b82f6", opinion: "#f59e0b", bridge: "#8b5cf6" };
            const labels = { fact: "事实", opinion: "观点", bridge: "桥梁" };
            return (
              <div key={i} style={{
                padding: "8px 12px", borderRadius: 6, background: "#0f172a",
                borderLeft: `3px solid ${colors[s.type]}`,
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ color: "#cbd5e1", fontSize: 13, flex: 1 }}>{s.text}</span>
                <span style={{
                  fontSize: 11, color: colors[s.type], fontWeight: 600,
                  background: colors[s.type] + "15", padding: "2px 8px", borderRadius: 4, flexShrink: 0,
                }}>
                  {labels[s.type]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WritingTool() {
  const [sections, setSections] = useState([
    { name: "Introduction", points: [""] },
    { name: "Results & Discussion", points: [""] },
    { name: "Conclusion", points: [""] },
  ]);

  const updatePoint = (si, pi, val) => {
    const ns = [...sections];
    ns[si].points[pi] = val;
    setSections(ns);
  };

  const addPoint = (si) => {
    const ns = [...sections];
    ns[si].points.push("");
    setSections(ns);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
        规划论文每部分要表达的要点和逻辑流
      </p>
      {sections.map((sec, si) => (
        <div key={si} style={{ padding: 12, background: "#0f172a", borderRadius: 10 }}>
          <div style={{ color: "#f59e0b", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
            {sec.name}
          </div>
          {sec.points.map((p, pi) => (
            <div key={pi} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
              <span style={{ color: "#475569", fontSize: 12, width: 20, textAlign: "right" }}>
                {pi + 1}.
              </span>
              <input value={p} onChange={(e) => updatePoint(si, pi, e.target.value)}
                placeholder="这一段要表达的核心观点/要点..."
                style={{
                  flex: 1, padding: "6px 10px", background: "#1e293b",
                  border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0",
                  fontSize: 13, outline: "none",
                }}
              />
            </div>
          ))}
          <button onClick={() => addPoint(si)} style={{
            marginTop: 4, padding: "4px 10px", background: "transparent",
            color: "#64748b", border: "1px dashed #334155", borderRadius: 6,
            cursor: "pointer", fontSize: 12, width: "100%",
          }}>+ 添加要点</button>
        </div>
      ))}
    </div>
  );
}

function GenericTool({ toolId }) {
  const toolComponents = {
    synonym: SynonymTool,
    search: SynonymTool,
    firstprinciple: FirstPrincipleTool,
    experiment: ExperimentTool,
    checklist: ChecklistTool,
    factcheck: FactCheckTool,
    writing: WritingTool,
  };
  const Comp = toolComponents[toolId];
  if (Comp) return <Comp />;
  return (
    <p style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: 20 }}>
      此工具正在开发中...
    </p>
  );
}

// ========== Main App ==========

export default function ResearchMethodologyToolkit() {
  const [activePhase, setActivePhase] = useState(0);
  const [activeTool, setActiveTool] = useState(null);
  const [view, setView] = useState("overview"); // overview | detail | tool

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a14",
      fontFamily: "'Noto Sans SC', 'SF Pro Display', -apple-system, sans-serif",
      color: "#e2e8f0", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px", borderBottom: "1px solid #1e293b",
        background: "linear-gradient(135deg, #0a0a14 0%, #1a1a2e 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 800,
              background: "linear-gradient(135deg, #e94560, #53d8fb)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: -0.5,
            }}>
              科研方法论工具箱
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
              基于《科学研究与论文写作》· 从思维到实践的全流程工具
            </p>
          </div>
          {view !== "overview" && (
            <button onClick={() => { setView("overview"); setActiveTool(null); }}
              style={{
                padding: "6px 14px", background: "#1e293b", color: "#94a3b8",
                border: "1px solid #334155", borderRadius: 8, cursor: "pointer", fontSize: 13,
              }}>
              ← 返回总览
            </button>
          )}
        </div>
      </div>

      {/* Overview - Phase Cards */}
      {view === "overview" && (
        <div style={{ padding: 20 }}>
          {/* Flow diagram */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 4, marginBottom: 24, flexWrap: "wrap",
          }}>
            {PHASES.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => { setActivePhase(i); setView("detail"); }}
                  style={{
                    padding: "8px 16px", background: p.accent + "25",
                    border: `1px solid ${p.accent}55`, borderRadius: 20,
                    color: "#e2e8f0", cursor: "pointer", fontSize: 13,
                    fontWeight: 600, transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = p.accent + "45";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = p.accent + "25";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  {p.icon} {p.title.split("·")[1]?.trim() || p.title}
                </button>
                {i < PHASES.length - 1 && (
                  <span style={{ color: "#334155", fontSize: 18 }}>→</span>
                )}
              </div>
            ))}
          </div>

          {/* Phase Cards Grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}>
            {PHASES.map((phase, i) => (
              <div key={i} onClick={() => { setActivePhase(i); setView("detail"); }}
                style={{
                  background: `linear-gradient(145deg, ${phase.color}, #0f172a)`,
                  borderRadius: 14, padding: 20, cursor: "pointer",
                  border: "1px solid #1e293b", transition: "all 0.3s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = phase.accent;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1e293b";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  position: "absolute", top: -20, right: -20, fontSize: 80,
                  opacity: 0.06, pointerEvents: "none",
                }}>
                  {phase.icon}
                </div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{phase.icon}</div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
                  {phase.title}
                </h3>
                <p style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: 13 }}>
                  {phase.subtitle}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {phase.points.slice(0, 3).map((p, j) => (
                    <div key={j} style={{
                      fontSize: 12, color: "#cbd5e1", display: "flex", gap: 6, alignItems: "flex-start",
                    }}>
                      <span style={{ color: phase.accent, flexShrink: 0 }}>•</span>
                      <span>{p.key}</span>
                    </div>
                  ))}
                  {phase.points.length > 3 && (
                    <span style={{ fontSize: 11, color: "#475569", marginLeft: 12 }}>
                      +{phase.points.length - 3} 更多...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tools Quick Access */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
              🛠️ 实践工具
            </h3>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 10,
            }}>
              {Object.entries(TOOLS).map(([id, tool]) => (
                <div key={id} onClick={() => { setActiveTool(id); setView("tool"); }}
                  style={{
                    padding: "12px 16px", background: "#0f172a",
                    borderRadius: 10, cursor: "pointer",
                    border: "1px solid #1e293b", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.background = "#131b2e";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#1e293b";
                    e.currentTarget.style.background = "#0f172a";
                  }}
                >
                  <span style={{ fontSize: 24 }}>{tool.icon}</span>
                  <div>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>
                      {tool.name}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>
                      {tool.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail View */}
      {view === "detail" && (
        <div style={{ padding: 20 }}>
          <div style={{
            background: `linear-gradient(145deg, ${PHASES[activePhase].color}, #0f172a)`,
            borderRadius: 16, padding: 24, marginBottom: 16,
            border: `1px solid ${PHASES[activePhase].accent}33`,
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>
              {PHASES[activePhase].icon}
            </div>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>
              {PHASES[activePhase].title}
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
              {PHASES[activePhase].subtitle}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PHASES[activePhase].points.map((point, i) => (
              <div key={i} style={{
                padding: 16, background: "#0f172a", borderRadius: 12,
                border: "1px solid #1e293b",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: "0 0 6px", fontSize: 15, fontWeight: 700,
                      color: PHASES[activePhase].accent,
                    }}>
                      {point.key}
                    </h4>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>
                      {point.detail}
                    </p>
                  </div>
                  {point.tool && (
                    <button
                      onClick={() => { setActiveTool(point.tool); setView("tool"); }}
                      style={{
                        padding: "6px 12px", background: "#1e293b",
                        color: "#93c5fd", border: "1px solid #334155",
                        borderRadius: 6, cursor: "pointer", fontSize: 12,
                        whiteSpace: "nowrap", marginLeft: 12, flexShrink: 0,
                      }}
                    >
                      {TOOLS[point.tool]?.icon} 使用工具
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool View */}
      {view === "tool" && activeTool && (
        <div style={{ padding: 20 }}>
          <div style={{
            padding: 20, background: "#0f172a", borderRadius: 14,
            border: "1px solid #1e293b",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{TOOLS[activeTool].icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  {TOOLS[activeTool].name}
                </h3>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 13 }}>
                  {TOOLS[activeTool].description}
                </p>
              </div>
            </div>
            <GenericTool toolId={activeTool} />
          </div>
        </div>
      )}
    </div>
  );
}
