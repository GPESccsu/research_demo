import { useState, useEffect, useCallback } from "react";
import { getDrafts, saveDraft, getUIState, saveUIState } from "../db";
import { callAI, callAIJSON } from "../services/aiService";
import { PROMPTS } from "../prompts/index";
import WritingOutline from "../components/writing/WritingOutline";
import WritingEditor from "../components/writing/WritingEditor";
import WritingAIPanel from "../components/writing/WritingAIPanel";
import SentenceCompareAssistant from "../components/writing/SentenceCompareAssistant";

const DEFAULT_TEXT = `锌空气电池因其理论能量密度高、成本低廉、环境友好等优点，被认为是下一代可持续能源存储技术的有力候选方案。

近年来，过渡金属氧化物成为替代贵金属催化剂的研究热点。

尽管已有大量研究，但对其构效关系的理解仍不够深入。`;

const DEFAULT_OUTLINE = [
  { id: "abstract", label: "摘要" },
  { id: "intro", label: "1. 引言" },
  { id: "intro-bg", label: "1.1 背景", sub: true },
  { id: "methods", label: "2. 实验方法" },
  { id: "results", label: "3. 结果讨论" },
  { id: "conclusion", label: "4. 结论" },
];

export default function WritingPage({ config }) {
  const [sec, setSec] = useState("intro");
  const [text, setText] = useState(DEFAULT_TEXT);
  const [outline, setOutline] = useState(DEFAULT_OUTLINE);
  const [outlineReady, setOutlineReady] = useState(false);
  const [sug, setSug] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Load drafts & outline from DB
  useEffect(() => {
    (async () => {
      try {
        const [drafts, outlineState] = await Promise.all([getDrafts(), getUIState("writing_outline")]);
        const found = drafts.find(x => x.id === sec);
        if (found) setText(found.content);
        if (outlineState?.items?.length) setOutline(outlineState.items);
      } finally {
        setOutlineReady(true);
      }
    })();
  }, [sec]);

  // Persist outline
  useEffect(() => {
    if (!outlineReady) return;
    saveUIState("writing_outline", { items: outline });
  }, [outline, outlineReady]);

  // Save text to DB
  const saveText = useCallback((val) => {
    setText(val);
    saveDraft({ id: sec, content: val, updatedAt: Date.now() });
  }, [sec]);

  // ── Outline actions ──
  const addSection = (label) => {
    const id = `section-${Date.now()}`;
    setOutline(prev => [...prev, { id, label }]);
    setSec(id);
    saveDraft({ id, content: "", updatedAt: Date.now() });
  };

  const deleteSection = (id) => {
    setOutline(prev => prev.filter(s => s.id !== id));
    if (sec === id) setSec("intro");
  };

  const updateSectionLabel = (id, label) => {
    setOutline(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  };

  const currentSectionLabel = outline.find(o => o.id === sec)?.label || "正文";

  // ── AI actions ──
  const analyze = async () => {
    setAnalyzing(true);
    setSug([]);
    const r = await callAIJSON(config, PROMPTS.WRITING_ANALYSIS, `引言:\n${text}`, 800);
    setAnalyzing(false);
    if (r?.suggestions) setSug(r.suggestions);
  };

  const askAI = async (question) => {
    setAnalyzing(true);
    const r = await callAI(config, PROMPTS.WRITING_QA, `段落:\n${text}\n\n问题:${question}`, 500);
    setAnalyzing(false);
    if (r) setSug(p => [...p, { type: "AI 回答", content: r, priority: "high" }]);
  };

  // ── Insert text at end of editor ──
  const insertToEditor = (content) => {
    const newText = text ? `${text}\n\n${content}` : content;
    saveText(newText);
  };

  return (
    <div className="writing-layout">
      <WritingOutline
        outline={outline}
        setOutline={setOutline}
        sec={sec}
        setSec={setSec}
        onAddSection={addSection}
        onDeleteSection={deleteSection}
      />
      <WritingEditor
        text={text}
        onTextChange={saveText}
        sectionLabel={currentSectionLabel}
        onSectionLabelChange={(label) => updateSectionLabel(sec, label)}
        onAnalyze={analyze}
        analyzing={analyzing}
      />
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <WritingAIPanel
          suggestions={sug}
          setSuggestions={setSug}
          analyzing={analyzing}
          onAsk={askAI}
          onInsertToEditor={insertToEditor}
        />
        <SentenceCompareAssistant
          config={config}
          onInsertToEditor={insertToEditor}
        />
      </div>
    </div>
  );
}
