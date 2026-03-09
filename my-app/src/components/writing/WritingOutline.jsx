import { useState } from "react";

const ChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>;
const Plus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;

function reorderList(list, fromIndex, toIndex) {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function useDragReorder(onReorder) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const startDrag = (index) => (e) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };
  const dragOver = (e) => e.preventDefault();
  const dropAt = (targetIndex) => (e) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDraggingIndex(null);
      return;
    }
    onReorder(sourceIndex, targetIndex);
    setDraggingIndex(null);
  };
  const endDrag = () => setDraggingIndex(null);
  return { draggingIndex, startDrag, dragOver, dropAt, endDrag };
}

export { reorderList, useDragReorder };

export default function WritingOutline({ outline, setOutline, sec, setSec, onAddSection, onDeleteSection }) {
  const [newSectionName, setNewSectionName] = useState("");
  const outlineDrag = useDragReorder((fromIndex, toIndex) => setOutline(prev => reorderList(prev, fromIndex, toIndex)));

  const addSection = () => {
    const label = newSectionName.trim();
    if (!label) return;
    onAddSection(label);
    setNewSectionName("");
  };

  return (
    <div className="writing-outline fade-in">
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>大纲</div>
      {outline.map((o, index) => (
        <div key={o.id}
          className={`outline-item ${o.sub ? 'outline-sub' : ''} ${sec === o.id ? 'active' : ''} ${outlineDrag.draggingIndex === index ? 'dragging' : ''}`}
          onClick={() => setSec(o.id)}
          draggable
          onDragStart={outlineDrag.startDrag(index)}
          onDragOver={outlineDrag.dragOver}
          onDrop={outlineDrag.dropAt(index)}
          onDragEnd={outlineDrag.endDrag}
        >
          <span className="drag-handle" title="拖拽排序">⋮⋮</span>
          {!o.sub && <ChevronRight />}
          <span style={{ flex: 1 }}>{o.label}</span>
          <button className="btn btn-secondary btn-sm" style={{ padding: '1px 6px' }} onClick={(e) => { e.stopPropagation(); onDeleteSection(o.id); }}>删</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        <input className="input-field" placeholder="新增章节" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSection()} />
        <button className="btn btn-secondary btn-sm" onClick={addSection}><Plus /></button>
      </div>
    </div>
  );
}
