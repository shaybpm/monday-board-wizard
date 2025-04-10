
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
import { Search, CheckSquare, Square, GripVertical, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from "@/components/ui/resizable";

interface BoardStructureProps {
  boardData: ParsedBoardData;
}

interface ColumnRow {
  id: string;
  title: string;
  type: string;
  firstLineValue?: string; // Added for first line data
  selected: boolean;
}

interface ColumnWidth {
  [key: string]: number;
}

const STORAGE_KEY_COLUMN_WIDTH = "monday-column-widths";
const STORAGE_KEY_COLUMN_ORDER = "monday-column-order";

// Absolute minimum width to prevent columns from disappearing
const MIN_COLUMN_WIDTH = 20;

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnRows, setColumnRows] = useState<ColumnRow[]>(
    boardData.columns.map(column => ({
      id: column.id,
      title: column.title,
      type: column.type,
      firstLineValue: column.id === "name" ? "First item name" : "N/A", // Default placeholder for first line data
      selected: false
    }))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ColumnRow;
    direction: "ascending" | "descending" | null;
  }>({ key: "id", direction: null });
  
  // Calculate optimal widths based on content
  const calculateDefaultWidths = () => {
    const widths: ColumnWidth = {
      id: 60,
      title: 100,
      type: 60,
      firstLine: 120 // Set default width for the first line column
    };
    
    boardData.columns.forEach(column => {
      widths.id = Math.max(widths.id, Math.min(100, column.id.length * 5 + 10));
      widths.title = Math.max(widths.title, Math.min(150, column.title.length * 5 + 20));
      widths.type = Math.max(widths.type, Math.min(100, column.type.length * 5 + 10));
    });
    
    return widths;
  };
  
  // For column widths
  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(calculateDefaultWidths());
  
  // For column reordering - with default order (now includes firstLine)
  const defaultColumnOrder = ["id", "title", "type", "firstLine"];
  const [columnOrder, setColumnOrder] = useState<string[]>(defaultColumnOrder);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // DOM refs
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Individual column refs for resizing
  const columnRefs = useRef<{[key: string]: React.RefObject<HTMLTableCellElement>}>({
    id: React.createRef(),
    title: React.createRef(),
    type: React.createRef(),
    firstLine: React.createRef() // Add a ref for the firstLine column
  });

  // Load saved column widths and order from localStorage on component mount
  useEffect(() => {
    try {
      // Load column widths
      const savedWidths = localStorage.getItem(STORAGE_KEY_COLUMN_WIDTH);
      if (savedWidths) {
        const parsedWidths = JSON.parse(savedWidths);
        // Make sure firstLine width is included
        if (!parsedWidths.firstLine) {
          parsedWidths.firstLine = 120; // Default width for firstLine
        }
        setColumnWidths(parsedWidths);
      } else {
        // No saved widths, use calculated defaults
        setColumnWidths(calculateDefaultWidths());
      }
      
      // Load column order
      const savedOrder = localStorage.getItem(STORAGE_KEY_COLUMN_ORDER);
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        // Add firstLine to the order if it's not already there
        if (!parsedOrder.includes("firstLine")) {
          parsedOrder.push("firstLine");
        }
        setColumnOrder(parsedOrder);
      } else {
        setColumnOrder(defaultColumnOrder);
      }
    } catch (error) {
      console.error("Error loading saved column settings:", error);
      // Fallback to defaults if there's an error
      setColumnWidths(calculateDefaultWidths());
      setColumnOrder(defaultColumnOrder);
    }

    // Attempt to fetch first line data for columns
    fetchFirstLineData();
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

  // Function to fetch first line data from the Monday board
  const fetchFirstLineData = () => {
    // Since we don't have real data, simulate first line values
    // In a real implementation, you would fetch this from the Monday API
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      console.error("No credentials found for fetching first line data");
      return;
    }

    // This would be replaced with actual API call to get first line data
    // For now, just setting sample values based on column types
    setColumnRows(prevRows => 
      prevRows.map(column => {
        let sampleValue = "N/A";
        
        switch(column.type) {
          case "name":
            sampleValue = "Sample Item";
            break;
          case "text":
            sampleValue = "Text example";
            break;
          case "date":
            sampleValue = "2025-04-10";
            break;
          case "numbers":
            sampleValue = "123.45";
            break;
          case "formula":
            sampleValue = "=SUM(A1:B2)";
            break;
          case "subtasks":
            sampleValue = "3 subtasks";
            break;
          default:
            sampleValue = column.type;
        }
        
        return {
          ...column,
          firstLineValue: sampleValue
        };
      })
    );
  };

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
  
  // Column resizing with mouse events - completely rewritten
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
    
    // Capture starting position and width
    startResizeX.current = e.clientX;
    startResizeWidth.current = columnWidths[columnId] || 100;
    
    // Set state to indicate we're resizing
    setResizing(true);
    setResizingColId(columnId);
    
    // Add event listeners to track mouse movement globally
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };
  
  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizing || !resizingColId) return;
    
    // Calculate width change
    const delta = e.clientX - startResizeX.current;
    
    // Apply new width with minimum constraint
    const newWidth = Math.max(MIN_COLUMN_WIDTH, startResizeWidth.current + delta);
    
    // Update width in state
    setColumnWidths(prev => ({
      ...prev,
      [resizingColId]: newWidth
    }));
  };
  
  const handleResizeMouseUp = () => {
    // Stop resizing
    setResizing(false);
    setResizingColId(null);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
  };
  
  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, []);
  
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
                  sortKey = null; // No sorting for first line data
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
                    
                    {/* Resizing handle */}
                    <div 
                      className={`absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-400 ${resizingColId === columnKey ? 'bg-blue-500' : 'bg-transparent'}`}
                      onMouseDown={(e) => handleResizeMouseDown(e, columnKey)}
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
                <TableRow key={column.id} className={`${column.selected ? 'bg-blue-50' : ''} h-6`}>
                  <TableCell className="text-center p-0 w-10">
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
                          style={{ 
                            width: `${columnWidths.id}px`,
                            maxWidth: `${columnWidths.id}px`
                          }}
                          className="font-mono text-xs p-1 truncate"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate inline-block w-full" title={column.id}>
                                {column.id}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{column.id}</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      );
                    }
                    if (columnKey === 'title') {
                      return (
                        <TableCell 
                          key={`${column.id}-title`}
                          style={{ 
                            width: `${columnWidths.title}px`,
                            maxWidth: `${columnWidths.title}px`
                          }}
                          className="p-1 truncate"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate inline-block w-full" title={column.title}>
                                {column.title}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{column.title}</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      );
                    }
                    if (columnKey === 'type') {
                      return (
                        <TableCell 
                          key={`${column.id}-type`}
                          style={{ 
                            width: `${columnWidths.type}px`,
                            maxWidth: `${columnWidths.type}px`
                          }}
                          className="p-1"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="px-1 py-0 bg-gray-100 rounded-md text-xs truncate inline-block w-full" title={column.type}>
                                {column.type}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{column.type}</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      );
                    }
                    if (columnKey === 'firstLine') {
                      return (
                        <TableCell 
                          key={`${column.id}-firstLine`}
                          style={{ 
                            width: `${columnWidths.firstLine}px`,
                            maxWidth: `${columnWidths.firstLine}px`
                          }}
                          className="p-1 truncate"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate inline-block w-full" title={column.firstLineValue}>
                                {column.firstLineValue}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{column.firstLineValue}</TooltipContent>
                          </Tooltip>
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

