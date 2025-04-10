
import React from "react";
import { Square, CheckSquare, GripVertical, FileText } from "lucide-react";
import { TableHead, TableRow } from "@/components/ui/table";
import { ColumnRow } from "./types";

interface TableHeaderProps {
  columnOrder: string[];
  columnWidths: Record<string, number>;
  filteredColumns: ColumnRow[];
  toggleAllSelection: () => void;
  requestSort: (key: keyof ColumnRow) => void;
  getSortIndicator: (key: keyof ColumnRow) => void;
  handleDragStart: (columnId: string, e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent, columnId: string) => void;
  handleDrop: (columnId: string) => void;
  handleDragEnd: () => void;
  handleResizeMouseDown: (e: React.MouseEvent<HTMLDivElement>, columnId: string) => void;
  resizingColId: string | null;
  draggedColumn: string | null;
  dragOverColumn: string | null;
  columnRefs: React.MutableRefObject<{
    [key: string]: React.RefObject<HTMLTableCellElement>;
  }>;
}

const MIN_COLUMN_WIDTH = 20;

const TableHeaderComponent: React.FC<TableHeaderProps> = ({
  columnOrder,
  columnWidths,
  filteredColumns,
  toggleAllSelection,
  requestSort,
  getSortIndicator,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleResizeMouseDown,
  resizingColId,
  draggedColumn,
  dragOverColumn,
  columnRefs
}) => {
  return (
    <TableRow className="h-8">
      <TableHead className="w-10 p-1">
        <div
          className="cursor-pointer flex justify-center"
          onClick={toggleAllSelection}
        >
          {filteredColumns.length > 0 && filteredColumns.every(col => col.selected) ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </div>
      </TableHead>
      {columnOrder.map(columnKey => {
        let title: string = "";
        let sortKey: keyof ColumnRow | null = null;
        let icon = null;
        
        if (columnKey === 'id') {
          title = "Column ID";
          sortKey = "id";
        } else if (columnKey === 'title') {
          title = "Column Name";
          sortKey = "title";
        } else if (columnKey === 'type') {
          title = "Column Type";
          sortKey = "type";
        } else if (columnKey === 'firstLine') {
          title = "First Line";
          sortKey = null;
          icon = <FileText className="h-4 w-4 mr-1" />;
        }
        
        if (columnKey !== 'firstLine' && !sortKey) return null;
        
        const dragActive = draggedColumn === columnKey;
        const dragOver = dragOverColumn === columnKey;
        const currentWidth = columnWidths[columnKey] || 100;
        
        return (
          <TableHead 
            key={columnKey}
            ref={columnRefs.current[columnKey]}
            className={`relative h-8 p-1 select-none border-r ${dragActive ? 'opacity-50' : ''} ${dragOver ? 'bg-gray-100' : ''}`}
            style={{ 
              width: `${currentWidth}px`,
              minWidth: `${MIN_COLUMN_WIDTH}px`,
              cursor: "default"
            }}
            draggable={true}
            onDragStart={(e) => handleDragStart(columnKey, e)}
            onDragOver={(e) => handleDragOver(e, columnKey)}
            onDrop={() => handleDrop(columnKey)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-center cursor-pointer">
              <GripVertical className="h-4 w-4 mr-1 cursor-grab text-gray-400" />
              {icon}
              <span 
                onClick={sortKey ? () => requestSort(sortKey) : undefined}
                className="truncate"
                title={title}
              >
                {title} {sortKey && getSortIndicator(sortKey)}
              </span>
            </div>
            
            <div 
              className={`absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-400 ${resizingColId === columnKey ? 'bg-blue-500' : 'bg-transparent'}`}
              onMouseDown={(e) => handleResizeMouseDown(e, columnKey)}
              title="Drag to resize"
            />
          </TableHead>
        );
      })}
    </TableRow>
  );
};

export default TableHeaderComponent;
