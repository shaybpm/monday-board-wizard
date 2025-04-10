import React, { useState, useRef, useEffect } from "react";
import { 
  Table,
  TableBody,
  TableCaption,
  TableHeader,
} from "@/components/ui/table";
import TableHeaderComponent from "./table-header";
import ColumnRowComponent from "./column-row";
import { ColumnRow, ColumnWidth } from "./types";

const STORAGE_KEY_COLUMN_WIDTH = "monday-column-widths";
const STORAGE_KEY_COLUMN_ORDER = "monday-column-order";
const MIN_COLUMN_WIDTH = 20;

interface ColumnsTableProps {
  columns: ColumnRow[];
  searchTerm: string;
  showSubitems: boolean;
}

const ColumnsTable: React.FC<ColumnsTableProps> = ({
  columns,
  searchTerm,
  showSubitems
}) => {
  const [columnRows, setColumnRows] = useState<ColumnRow[]>(columns);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ColumnRow;
    direction: "ascending" | "descending" | null;
  }>({ key: "id", direction: null });

  useEffect(() => {
    setColumnRows(columns);
  }, [columns]);

  const calculateDefaultWidths = () => {
    const widths: ColumnWidth = {
      id: 60,
      title: 100,
      type: 60,
      firstLine: 120
    };
    
    columns.forEach(column => {
      widths.id = Math.max(widths.id, Math.min(100, column.id.length * 5 + 10));
      widths.title = Math.max(widths.title, Math.min(150, column.title.length * 5 + 20));
      widths.type = Math.max(widths.type, Math.min(100, column.type.length * 5 + 10));
      
      if (column.firstLineValue) {
        const valueLength = column.firstLineValue.length;
        widths.firstLine = Math.max(widths.firstLine, Math.min(200, valueLength * 5 + 20));
      }
    });
    
    return widths;
  };

  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(calculateDefaultWidths());
  const defaultColumnOrder = ["title", "id", "type", "firstLine"];
  const [columnOrder, setColumnOrder] = useState<string[]>(defaultColumnOrder);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<{[key: string]: React.RefObject<HTMLTableCellElement>}>({
    id: React.createRef(),
    title: React.createRef(),
    type: React.createRef(),
    firstLine: React.createRef()
  });

  useEffect(() => {
    try {
      const savedWidths = localStorage.getItem(STORAGE_KEY_COLUMN_WIDTH);
      if (savedWidths) {
        const parsedWidths = JSON.parse(savedWidths);
        if (!parsedWidths.firstLine) {
          parsedWidths.firstLine = 120;
        }
        if (parsedWidths.itemId) {
          delete parsedWidths.itemId;
        }
        setColumnWidths(parsedWidths);
      } else {
        setColumnWidths(calculateDefaultWidths());
      }
      
      const savedOrder = localStorage.getItem(STORAGE_KEY_COLUMN_ORDER);
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        const filteredOrder = parsedOrder.filter((col: string) => col !== "itemId");
        
        if (!filteredOrder.includes("firstLine")) {
          filteredOrder.push("firstLine");
        }
        
        // Ensure title comes before id regardless of saved order
        if (filteredOrder.includes("title") && filteredOrder.includes("id")) {
          const titleIndex = filteredOrder.indexOf("title");
          const idIndex = filteredOrder.indexOf("id");
          
          if (idIndex < titleIndex) {
            filteredOrder.splice(idIndex, 1);
            filteredOrder.splice(titleIndex - 1, 0, "id");
          }
        }
        
        setColumnOrder(filteredOrder);
      } else {
        setColumnOrder(defaultColumnOrder);
      }
    } catch (error) {
      console.error("Error loading saved column settings:", error);
      setColumnWidths(calculateDefaultWidths());
      setColumnOrder(defaultColumnOrder);
    }
  }, []);

  useEffect(() => {
    // Save column widths and order when they change
    try {
      localStorage.setItem(STORAGE_KEY_COLUMN_WIDTH, JSON.stringify(columnWidths));
      localStorage.setItem(STORAGE_KEY_COLUMN_ORDER, JSON.stringify(columnOrder));
    } catch (error) {
      console.error("Error saving column settings:", error);
    }
  }, [columnWidths, columnOrder]);
  
  const filteredColumns = columnRows.filter(column => {
    if (!searchTerm) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      column.id.toLowerCase().includes(lowerSearchTerm) ||
      column.title.toLowerCase().includes(lowerSearchTerm) ||
      column.type.toLowerCase().includes(lowerSearchTerm) ||
      (column.firstLineValue && column.firstLineValue.toLowerCase().includes(lowerSearchTerm)) ||
      (column.itemId && column.itemId.toLowerCase().includes(lowerSearchTerm)) ||
      (column.itemName && column.itemName.toLowerCase().includes(lowerSearchTerm))
    );
  });
  
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
  
  const getSortIndicator = (key: keyof ColumnRow): React.ReactNode => {
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
        if (filteredColumns.some(col => col.id === row.id)) {
          return { ...row, selected: !allSelected };
        }
        return row;
      })
    );
  };

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
    
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };
  
  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizing || !resizingColId) return;
    
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
    
    document.removeEventListener('mousemove', handleResizeMouseMove);
    document.removeEventListener('mouseup', handleResizeMouseUp);
  };
  
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, []);
  
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
    <div className="rounded-md border overflow-x-auto" ref={tableRef}>
      <Table>
        <TableCaption>
          {showSubitems 
            ? `Subitems Structure - Total ${columns.length} Columns`
            : `Board Structure - Total ${columns.length} Columns`}
        </TableCaption>
        <TableHeader>
          <TableHeaderComponent 
            columnOrder={columnOrder}
            columnWidths={columnWidths}
            filteredColumns={filteredColumns}
            toggleAllSelection={toggleAllSelection}
            requestSort={requestSort}
            getSortIndicator={getSortIndicator}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragEnd={handleDragEnd}
            handleResizeMouseDown={handleResizeMouseDown}
            resizingColId={resizingColId}
            draggedColumn={draggedColumn}
            dragOverColumn={dragOverColumn}
            columnRefs={columnRefs}
          />
        </TableHeader>
        <TableBody>
          {sortedColumns.length === 0 ? (
            <tr>
              <td colSpan={columnOrder.length + 1} className="h-10 text-center">
                No columns found.
              </td>
            </tr>
          ) : (
            sortedColumns.map((column) => (
              <ColumnRowComponent
                key={column.id}
                column={column}
                columnWidths={columnWidths}
                columnOrder={columnOrder}
                toggleRowSelection={toggleRowSelection}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ColumnsTable;
