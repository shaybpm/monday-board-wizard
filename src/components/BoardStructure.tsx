
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

const STORAGE_KEY_COLUMN_WIDTH = "monday-column-widths";
const STORAGE_KEY_COLUMN_ORDER = "monday-column-order";

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
  
  // Default column widths based on content
  const calculateDefaultWidths = () => {
    const widths: ColumnWidth = {
      id: 100,  // Start with minimal values
      title: 150,
      type: 100
    };
    
    // Estimate width based on content length
    boardData.columns.forEach(column => {
      // ID column - base on longest ID
      widths.id = Math.max(widths.id, Math.min(250, column.id.length * 8 + 40));
      
      // Title column - base on longest title 
      widths.title = Math.max(widths.title, Math.min(350, column.title.length * 8 + 60));
      
      // Type column - base on longest type
      widths.type = Math.max(widths.type, Math.min(200, column.type.length * 9 + 50));
    });
    
    return widths;
  };
  
  // For column resizing
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(calculateDefaultWidths());
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(0);
  
  // For column reordering - with default order
  const defaultColumnOrder = ["id", "title", "type"];
  const [columnOrder, setColumnOrder] = useState<string[]>(defaultColumnOrder);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // DOM ref for table container to handle mouse events correctly
  const tableRef = useRef<HTMLDivElement>(null);

  // Load saved column widths and order from localStorage on component mount
  useEffect(() => {
    try {
      // Load column widths
      const savedWidths = localStorage.getItem(STORAGE_KEY_COLUMN_WIDTH);
      if (savedWidths) {
        setColumnWidths(JSON.parse(savedWidths));
      } else {
        // No saved widths, use calculated defaults
        setColumnWidths(calculateDefaultWidths());
      }
      
      // Load column order
      const savedOrder = localStorage.getItem(STORAGE_KEY_COLUMN_ORDER);
      if (savedOrder) {
        setColumnOrder(JSON.parse(savedOrder));
      }
    } catch (error) {
      console.error("Error loading saved column settings:", error);
      // Fallback to defaults if there's an error
      setColumnWidths(calculateDefaultWidths());
      setColumnOrder(defaultColumnOrder);
    }
  }, []);

  // Save column widths and order to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLUMN_WIDTH, JSON.stringify(columnWidths));
    } catch (error) {
      console.error("Error saving column widths:", error);
    }
  }, [columnWidths]);
  
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLUMN_ORDER, JSON.stringify(columnOrder));
    } catch (error) {
      console.error("Error saving column order:", error);
    }
  }, [columnOrder]);

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
  
  // Improved column resizing handlers
  const handleResizeStart = (columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnId] || 150);
    
    function handleMouseMove(moveEvent: MouseEvent) {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      if (resizingColumn) {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(80, startWidth + deltaX);
        
        setColumnWidths(prev => ({
          ...prev,
          [columnId]: newWidth
        }));
      }
    }
    
    function handleMouseUp() {
      setResizingColumn(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  
  // Column reordering handlers
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
  
  const handleDragEnd = () => {
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
      
      <div className="rounded-md border overflow-x-auto" ref={tableRef}>
        <Table>
          <TableCaption>Board Structure - Total {boardData.columns.length} Columns</TableCaption>
          <TableHeader>
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
                
                const dragActive = draggedColumn === columnKey;
                const dragOver = dragOverColumn === columnKey;
                
                return (
                  <TableHead 
                    key={columnKey}
                    className={`relative h-8 p-1 select-none border-r ${dragActive ? 'opacity-50' : ''} ${dragOver ? 'bg-gray-100' : ''}`}
                    style={{ 
                      width: `${columnWidths[columnKey] || 150}px`, 
                      minWidth: "80px",
                      maxWidth: "500px", 
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
                      <span 
                        onClick={() => requestSort(sortKey!)}
                        className="truncate"
                        title={title}
                      >
                        {title} {getSortIndicator(sortKey)}
                      </span>
                    </div>
                    <div 
                      className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-300 active:bg-blue-400"
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
                <TableCell colSpan={columnOrder.length + 1} className="h-10 text-center">
                  No columns found.
                </TableCell>
              </TableRow>
            ) : (
              sortedColumns.map((column) => (
                <TableRow key={column.id} className={`${column.selected ? 'bg-blue-50' : ''} h-7`}>
                  <TableCell className="text-center p-0">
                    <div 
                      className="cursor-pointer inline-flex"
                      onClick={() => toggleRowSelection(column.id)}
                    >
                      {column.selected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </div>
                  </TableCell>
                  {columnOrder.map((columnKey) => {
                    if (columnKey === 'id') {
                      return (
                        <TableCell 
                          key={`${column.id}-id`}
                          style={{ width: `${columnWidths.id}px` }}
                          className="font-mono text-xs p-1 truncate"
                          title={column.id}
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
                          className="p-1 truncate"
                          title={column.title}
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
                          className="p-1"
                        >
                          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs truncate inline-block max-w-full" title={column.type}>
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
