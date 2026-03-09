import { useState, useCallback } from "react";

const MOVES = {
  intro: {
    label: "引言 (Introduction)",
    tags: [
      { id: "background", name: "背景介绍", color: "#2563eb", desc: "介绍研究领域的大背景，建立研究重要性", template: "Because of their high energy and power density, [研究对象] are currently the most promising [应用领域] technology for [具体应用]." },
      { id: "importance", name: "研究意义", color: "#7c3aed", desc: "强调该研究方向的重要性和价值", template: "To further increase the [性能指标] of [研究对象], relentless research efforts have been invested in the development of [研究方向]." },
      { id: "prior_work", name: "前人工作", color: "#0891b2", desc: "综述已有研究成果和方法", template: "Commercial [产品] typically rely on [技术/方法]. However, much higher [性能] have been achieved using [新技术]." },
      { id: "problem", name: "现存问题", color: "#dc2626", desc: "指出现有研究的不足和挑战", template: "Unfortunately, these high capacity materials have disadvantages including [问题1], [问题2], and [问题3]." },
      { id: "solution_overview", name: "解决思路", color: "#059669", desc: "概述应对挑战的策略和方向", template: "To improve [性能指标], as well as to alleviate [问题], previous researchers have looked into [方法/策略]." },
      { id: "limitation", name: "方法局限", color: "#ea580c", desc: "指出已有解决方案的局限性", template: "However, [方法] often introduces problems of its own such as [局限1] as well as [局限2]." },
      { id: "this_work", name: "本文工作", color: "#16a34a", desc: "介绍本研究的核心工作和方法", template: "In this work, we combine several of the above principles to fabricate [研究成果]. In particular, we focus on [具体方法]." },
      { id: "material_choice", name: "材料/方法选择", color: "#ca8a04", desc: "解释为什么选择特定材料或方法", template: "[材料/方法] is a promising [类型] because of its [优势1], [优势2], and [优势3]." },
      { id: "approach_detail", name: "方案细节", color: "#9333ea", desc: "描述具体的研究方案和技术路线", template: "Here, we start from [起点] and react them with [反应物] to form [产物] for [目的]." },
      { id: "result_preview", name: "结果预览", color: "#e11d48", desc: "预告主要研究结果", template: "The proposed [方法] approach can fabricate [产物特征] for [应用]." },
    ],
  },
};

const FLOW_TEMPLATES = [
  {
    name: "经典 CARS 模型",
    desc: "背景→意义→前人→问题→思路→本文",
    flow: ["background", "importance", "prior_work", "problem", "solution_overview", "this_work"],
  },
  {
    name: "问题驱动型",
    desc: "背景→问题→前人→局限→本文→细节",
    flow: ["background", "problem", "prior_work", "limitation", "this_work", "approach_detail"],
  },
  {
    name: "完整版引言",
    desc: "全流程覆盖，适合长篇论文",
    flow: ["background", "importance", "prior_work", "problem", "solution_overview", "limitation", "material_choice", "this_work", "approach_detail", "result_preview"],
  },
];

function TagBadge({ tag, onClick, active, small }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 transition-all duration-200 ${small ? "px-2.5 py-0.5 text-xs" : "px-3 py-1.5 text-sm"} ${active ? "shadow-lg scale-105" : "opacity-80 hover:opacity-100 hover:scale-102"}`}
      style={{
        borderColor: tag.color,
        backgroundColor: active ? tag.color + "18" : "transparent",
        color: tag.color,
      }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </button>
  );
}

export default function IntroMethodologyTool() {
  const [mode, setMode] = useState("write"); // write | label | learn
  const [paragraphs, setParagraphs] = useState([{ id: 1, text: "", tag: null }]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [labelText, setLabelText] = useState("");
  const [labelResults, setLabelResults] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [showGuide, setShowGuide] = useState(null);

  const tags = MOVES.intro.tags;

  const addParagraph = () => {
    setParagraphs((prev) => [...prev, { id: Date.now(), text: "", tag: null }]);
  };

  const removeParagraph = (id) => {
    if (paragraphs.length > 1) {
      setParagraphs((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const updateParagraph = (id, field, value) => {
    setParagraphs((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const applyTemplate = (template) => {
    setSelectedTemplate(template);
    const newParagraphs = template.flow.map((tagId, i) => ({
      id: Date.now() + i,
      text: "",
      tag: tags.find((t) => t.id === tagId) || null,
    }));
    setParagraphs(newParagraphs);
  };

  const moveParagraph = (index, direction) => {
    const newArr = [...paragraphs];
    const target = index + direction;
    if (target < 0 || target >= newArr.length) return;
    [newArr[index], newArr[target]] = [newArr[target], newArr[index]];
    setParagraphs(newArr);
  };

  const splitTextForLabeling = () => {
    if (!labelText.trim()) return;
    const sentences = labelText.split(/(?<=[。.!?！？])\s*/).filter((s) => s.trim());
    setLabelResults(sentences.map((s, i) => ({ id: i, text: s.trim(), tag: null })));
  };

  const exportText = () => {
    const lines = paragraphs
      .filter((p) => p.text.trim())
      .map((p) => {
        const tagLabel = p.tag ? `【${p.tag.name}】` : "";
        return `${tagLabel}\n${p.text}`;
      });
    return lines.join("\n\n");
  };

  const getProgress = () => {
    const filled = paragraphs.filter((p) => p.text.trim() && p.tag).length;
    return Math.round((filled / Math.max(paragraphs.length, 1)) * 100);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", fontFamily: "'Noto Sans SC', 'SF Pro Display', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="border-b" style={{ borderColor: "#334155", background: "rgba(15,23,42,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>
                <span style={{ color: "#60a5fa" }}>✦</span> 学术引言写作助手
              </h1>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>基于 CARS 模型 · 标签化引言方法论工具</p>
            </div>

            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              {[
                { key: "write", icon: "✍️", label: "写作模式" },
                { key: "label", icon: "🏷️", label: "标注模式" },
                { key: "learn", icon: "📖", label: "学习指南" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: mode === m.key ? "#3b82f6" : "transparent",
                    color: mode === m.key ? "#fff" : "#94a3b8",
                  }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ==================== WRITE MODE ==================== */}
        {mode === "write" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Tag palette */}
            <div className="col-span-4">
              <div className="rounded-2xl p-5 sticky top-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "#e2e8f0" }}>🎯 标签面板 · 点击查看写作指导</h3>

                <div className="flex flex-wrap gap-2 mb-5">
                  {tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} active={activeTag?.id === tag.id} onClick={() => setActiveTag(activeTag?.id === tag.id ? null : tag)} />
                  ))}
                </div>

                {activeTag && (
                  <div className="rounded-xl p-4 mt-3" style={{ background: activeTag.color + "12", border: `1px solid ${activeTag.color}30` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: activeTag.color }} />
                      <span className="font-semibold text-sm" style={{ color: activeTag.color }}>{activeTag.name}</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: "#cbd5e1" }}>{activeTag.desc}</p>
                    <p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>参考句式：</p>
                    <p className="text-xs italic rounded-lg p-2.5" style={{ color: "#e2e8f0", background: "rgba(0,0,0,0.3)" }}>{activeTag.template}</p>
                  </div>
                )}

                <div className="mt-5 pt-4" style={{ borderTop: "1px solid #334155" }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: "#e2e8f0" }}>⚡ 快速模板</h4>
                  {FLOW_TEMPLATES.map((tmpl, i) => (
                    <button
                      key={i}
                      onClick={() => applyTemplate(tmpl)}
                      className="w-full text-left rounded-xl p-3 mb-2 transition-all hover:scale-[1.01]"
                      style={{
                        background: selectedTemplate?.name === tmpl.name ? "#3b82f620" : "#0f172a",
                        border: selectedTemplate?.name === tmpl.name ? "1px solid #3b82f650" : "1px solid #334155",
                      }}
                    >
                      <div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{tmpl.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{tmpl.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #334155" }}>
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: "#94a3b8" }}>写作进度</span>
                    <span style={{ color: "#60a5fa" }}>{getProgress()}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#0f172a" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${getProgress()}%`, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Writing area */}
            <div className="col-span-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#e2e8f0" }}>📝 引言段落编辑</h3>
                <div className="flex gap-2">
                  <button onClick={addParagraph} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#3b82f6", color: "#fff" }}>
                    + 添加段落
                  </button>
                  <button
                    onClick={() => {
                      const text = exportText();
                      if (navigator.clipboard) navigator.clipboard.writeText(text);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "#334155", color: "#e2e8f0" }}
                  >
                    📋 复制全文
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {paragraphs.map((para, index) => (
                  <div key={para.id} className="rounded-2xl p-5 transition-all" style={{ background: "#1e293b", border: para.tag ? `2px solid ${para.tag.color}40` : "1px solid #334155" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#0f172a", color: "#64748b" }}>#{index + 1}</span>

                        <select
                          value={para.tag?.id || ""}
                          onChange={(e) => {
                            const tag = tags.find((t) => t.id === e.target.value) || null;
                            updateParagraph(para.id, "tag", tag);
                          }}
                          className="text-sm rounded-lg px-3 py-1.5 outline-none"
                          style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid #475569" }}
                        >
                          <option value="">选择标签...</option>
                          {tags.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>

                        {para.tag && <TagBadge tag={para.tag} active small />}
                      </div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => moveParagraph(index, -1)} disabled={index === 0} className="p-1.5 rounded-lg text-xs" style={{ color: index === 0 ? "#334155" : "#94a3b8" }}>▲</button>
                        <button onClick={() => moveParagraph(index, 1)} disabled={index === paragraphs.length - 1} className="p-1.5 rounded-lg text-xs" style={{ color: index === paragraphs.length - 1 ? "#334155" : "#94a3b8" }}>▼</button>
                        <button onClick={() => removeParagraph(para.id)} className="p-1.5 rounded-lg text-xs" style={{ color: "#ef4444" }}>✕</button>
                      </div>
                    </div>

                    {para.tag && !para.text && (
                      <div className="mb-3 rounded-lg p-3 text-xs" style={{ background: para.tag.color + "10", color: "#94a3b8" }}>
                        💡 参考：{para.tag.template}
                      </div>
                    )}

                    <textarea
                      value={para.text}
                      onChange={(e) => updateParagraph(para.id, "text", e.target.value)}
                      placeholder={para.tag ? `在此写入${para.tag.name}相关内容...` : "在此写入段落内容..."}
                      rows={4}
                      className="w-full rounded-xl p-4 text-sm outline-none resize-none"
                      style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid #334155", lineHeight: 1.8 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== LABEL MODE ==================== */}
        {mode === "label" && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-6 mb-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "#e2e8f0" }}>🏷️ 引言标注模式</h3>
              <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>粘贴一篇论文的引言，自动按句拆分，然后为每句话标注功能标签。</p>

              <textarea
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                placeholder="在此粘贴论文引言全文（英文或中文）..."
                rows={6}
                className="w-full rounded-xl p-4 text-sm outline-none resize-none mb-4"
                style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid #334155", lineHeight: 1.8 }}
              />
              <button onClick={splitTextForLabeling} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#3b82f6", color: "#fff" }}>
                拆分 & 开始标注
              </button>
            </div>

            {labelResults.length > 0 && (
              <div className="space-y-3">
                {labelResults.map((item, i) => (
                  <div key={item.id} className="rounded-xl p-4 transition-all" style={{ background: "#1e293b", border: item.tag ? `2px solid ${item.tag.color}40` : "1px solid #334155" }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded mt-1 shrink-0" style={{ background: "#0f172a", color: "#64748b" }}>S{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm mb-3" style={{ color: "#e2e8f0", lineHeight: 1.7 }}>{item.text}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <TagBadge
                              key={tag.id}
                              tag={tag}
                              active={item.tag?.id === tag.id}
                              small
                              onClick={() => {
                                setLabelResults((prev) => prev.map((r) => (r.id === item.id ? { ...r, tag: r.tag?.id === tag.id ? null : tag } : r)));
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== LEARN MODE ==================== */}
        {mode === "learn" && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-6 mb-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>📖 引言写作方法论指南</h3>
              <p className="text-sm" style={{ color: "#94a3b8" }}>基于 Swales CARS 模型和学术论文引言标注方法</p>
            </div>

            {[
              {
                title: "核心理念：引言是一个「漏斗」",
                content: "好的引言从宏观背景开始，逐步聚焦到你的具体研究。就像漏斗一样，先建立大的研究领域的重要性，再缩小到具体的研究问题和你的解决方案。每一段都有明确的功能角色。",
              },
              {
                title: "Move 1：建立研究领域 (Establishing a Territory)",
                content: "这是引言的开头部分。你需要向读者展示你的研究领域为什么重要。通常包括：介绍大背景（背景介绍标签）、声明研究的重要性（研究意义标签）、综述前人已有的研究工作（前人工作标签）。",
              },
              {
                title: "Move 2：确立研究定位 (Establishing a Niche)",
                content: "指出前人工作的不足之处，创造你的研究空间。包括：指出现有方法的问题（现存问题标签）、说明已有解决方案的局限性（方法局限标签）。常用转折词：However, Unfortunately, Although... 等。",
              },
              {
                title: "Move 3：占据研究定位 (Occupying the Niche)",
                content: "描述你的研究如何填补上述空白。包括：概述你的解决思路（解决思路标签）、说明本文的具体工作（本文工作标签）、解释材料/方法的选择理由（材料选择标签）、给出具体方案细节（方案细节标签）、预告研究结果（结果预览标签）。",
              },
              {
                title: "标注练习方法",
                content: "1. 找一篇你领域的优秀论文\n2. 复制引言到「标注模式」\n3. 为每个句子分配功能标签\n4. 观察优秀论文的标签排列模式\n5. 模仿这个模式来写自己的引言",
              },
              {
                title: "常见引言流程模板",
                content: "• 经典模式：背景 → 意义 → 前人工作 → 问题 → 思路 → 本文工作\n• 问题驱动：背景 → 问题 → 前人尝试 → 局限 → 本文方案 → 细节\n• 完整版：背景 → 意义 → 前人 → 问题 → 思路 → 局限 → 材料选择 → 本文 → 细节 → 预告结果",
              },
            ].map((section, i) => (
              <div key={i} className="rounded-2xl p-5 mb-4 cursor-pointer transition-all hover:scale-[1.005]" style={{ background: "#1e293b", border: "1px solid #334155" }} onClick={() => setShowGuide(showGuide === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{section.title}</h4>
                  <span style={{ color: "#64748b" }}>{showGuide === i ? "▲" : "▼"}</span>
                </div>
                {showGuide === i && (
                  <p className="text-sm mt-3 whitespace-pre-line" style={{ color: "#94a3b8", lineHeight: 1.8 }}>{section.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
