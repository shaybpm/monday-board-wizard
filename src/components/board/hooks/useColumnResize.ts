
import { useState, useRef } from "react";
import { ColumnWidth } from "../types";

const MIN_COLUMN_WIDTH = 20;

export const useColumnResize = (
  columnWidths: ColumnWidth,
  setColumnWidths?: React.Dispatch<React.SetStateAction<ColumnWidth>>
) => {
  const [resizing, setResizing] = useState(false);
  const [resizingColId, setResizingColId] = useState<string | null>(null);
  const startResizeX = useRef(0);
  const startResizeWidth = useRef(0);
  
  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    columnId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    startResizeX.current = e.clientX;
    startResizeWidth.current = columnWidths[columnId] || 100;
    
    setResizing(true);
    setResizingColId(columnId);
  };
  
  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizing || !resizingColId || !setColumnWidths) return;
    
    const delta = e.clientX - startResizeX.current;
    
    const newWidth = Math.max(MIN_COLUMN_WIDTH, startResizeWidth.current + delta);
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColId]: newWidth
    }));
  };
  
  const handleResizeMouseUp = () => {
    setResizing(false);
    setResizingColId(null);
  };
  
  return {
    resizing,
    resizingColId,
    handleResizeMouseDown,
    handleResizeMouseMove,
    handleResizeMouseUp
  };
};
