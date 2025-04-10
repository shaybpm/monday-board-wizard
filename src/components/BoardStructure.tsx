
import React, { useState, useRef, useEffect } from "react";
import { ParsedBoardData } from "@/lib/types";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, CheckSquare, Square, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BoardStructureProps {
  boardData: ParsedBoardData;
}

interface ColumnRow {
  id: string;
  title: string;
  type: string;
  selected: boolean;
}

interface ColumnWidth {
  [key: string]: number;
}

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnRows, setColumnRows] = useState<ColumnRow[]>(
    boardData.columns.map(column => ({
      id: column.id,
      title: column.title,
      type: column.type,
      selected: false
    }))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ColumnRow;
    direction: "ascending" | "descending" | null;
  }>({ key: "id", direction: null });
  
  // For column resizing
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>({
    id: 150,
    title: 250,
    type: 150
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);
  
  // For column reordering
  const [columnOrder, setColumnOrder] = useState<string[]>(["id", "title", "type"]);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filter columns based on search term
  const filteredColumns = columnRows.filter(column => {
    if (!searchTerm) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      column.id.toLowerCase().includes(lowerSearchTerm) ||
      column.title.toLowerCase().includes(lowerSearchTerm) ||
      column.type.toLowerCase().includes(lowerSearchTerm)
    );
  });
  
  // Sort columns
  const sortedColumns = [...filteredColumns].sort((a, b) => {
    if (sortConfig.direction === null) {
      return 0;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });
  
  const requestSort = (key: keyof ColumnRow) => {
    let direction: "ascending" | "descending" | null = "ascending";
    
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (sortConfig.key === key && sortConfig.direction === "descending") {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof ColumnRow) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };
  
  const toggleRowSelection = (id: string) => {
    setColumnRows(rows => 
      rows.map(row => 
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    );
  };
  
  const toggleAllSelection = () => {
    const allSelected = sortedColumns.every(col => col.selected);
    setColumnRows(rows => 
      rows.map(row => {
        // Only toggle rows that are currently visible in the filter
        if (filteredColumns.some(col => col.id === row.id)) {
          return { ...row, selected: !allSelected };
        }
        return row;
      })
    );
  };

  const selectedCount = columnRows.filter(col => col.selected).length;
  
  // Column resizing handlers
  const handleResizeStart = (columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnId] || 150);
    
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingColumn) return;
    
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(100, startWidth + deltaX);
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  };
  
  const handleResizeEnd = () => {
    setResizingColumn(null);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  };
  
  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);
  
  // Column reordering handlers
  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };
  
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };
  
  const handleDrop = (columnId: string) => {
    if (draggedColumn === null) return;
    
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
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div>
              <Button
                variant="outline"
                disabled={selectedCount === 0}
                className="whitespace-nowrap"
              >
                Selected ({selectedCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableCaption>Board Structure - Total {boardData.columns.length} Columns</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <div
                  className="cursor-pointer flex justify-center"
                  onClick={toggleAllSelection}
                >
                  {filteredColumns.length > 0 && filteredColumns.every(col => col.selected) ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </div>
              </TableHead>
              {columnOrder.map(columnKey => {
                let title: string = "";
                let sortKey: keyof ColumnRow | null = null;
                
                if (columnKey === 'id') {
                  title = "Column ID";
                  sortKey = "id";
                } else if (columnKey === 'title') {
                  title = "Column Name";
                  sortKey = "title";
                } else if (columnKey === 'type') {
                  title = "Column Type";
                  sortKey = "type";
                }
                
                if (!sortKey) return null;
                
                return (
                  <TableHead 
                    key={columnKey}
                    className="resizable-th relative"
                    style={{ width: `${columnWidths[columnKey]}px`, minWidth: "100px" }}
                    draggable
                    onDragStart={() => handleDragStart(columnKey)}
                    onDragOver={(e) => handleDragOver(e, columnKey)}
                    onDrop={() => handleDrop(columnKey)}
                    data-dragging={draggedColumn === columnKey}
                    data-dragged-over={dragOverColumn === columnKey}
                  >
                    <div className="flex items-center cursor-pointer select-none">
                      <GripVertical className="h-4 w-4 mr-2 cursor-grab text-gray-400" />
                      <span onClick={() => requestSort(sortKey!)}>
                        {title} {getSortIndicator(sortKey)}
                      </span>
                    </div>
                    <div 
                      className="resizer"
                      onMouseDown={(e) => handleResizeStart(columnKey, e)} 
                      title="Drag to resize"
                    />
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedColumns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnOrder.length + 1} className="h-24 text-center">
                  No columns found.
                </TableCell>
              </TableRow>
            ) : (
              sortedColumns.map((column) => (
                <TableRow key={column.id} className={column.selected ? 'bg-blue-50' : ''}>
                  <TableCell className="text-center">
                    <div 
                      className="cursor-pointer inline-flex"
                      onClick={() => toggleRowSelection(column.id)}
                    >
                      {column.selected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </div>
                  </TableCell>
                  {columnOrder.map((columnKey) => {
                    if (columnKey === 'id') {
                      return (
                        <TableCell 
                          key={`${column.id}-id`}
                          style={{ width: `${columnWidths.id}px` }}
                          className="font-mono text-sm"
                        >
                          {column.id}
                        </TableCell>
                      );
                    }
                    if (columnKey === 'title') {
                      return (
                        <TableCell 
                          key={`${column.id}-title`}
                          style={{ width: `${columnWidths.title}px` }}
                        >
                          {column.title}
                        </TableCell>
                      );
                    }
                    if (columnKey === 'type') {
                      return (
                        <TableCell 
                          key={`${column.id}-type`}
                          style={{ width: `${columnWidths.type}px` }}
                        >
                          <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                            {column.type}
                          </span>
                        </TableCell>
                      );
                    }
                    return null;
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BoardStructure;
