
import { useState } from "react";

export const useColumnDrag = (
  columnOrder: string[],
  setColumnOrder?: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  
  const handleDragStart = (columnId: string, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      setDraggedColumn(columnId);
    }, 0);
  };
  
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };
  
  const handleDrop = (columnId: string) => {
    if (draggedColumn === null || !setColumnOrder) return;
    
    const newColumnOrder = [...columnOrder];
    const draggedIndex = newColumnOrder.indexOf(draggedColumn);
    const dropIndex = newColumnOrder.indexOf(columnId);
    
    if (draggedIndex !== -1 && dropIndex !== -1) {
      newColumnOrder.splice(draggedIndex, 1);
      newColumnOrder.splice(dropIndex, 0, draggedColumn);
      setColumnOrder(newColumnOrder);
    }
    
    setDraggedColumn(null);
    setDragOverColumn(null);
  };
  
  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };
  
  return {
    draggedColumn,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};
