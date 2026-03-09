import { useState } from "react";

export default function useDragReorder(onReorder) {
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
