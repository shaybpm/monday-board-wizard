
import React, { useState, useEffect } from "react";
import { 
  Table,
  TableBody,
  TableCaption,
  TableHeader,
} from "@/components/ui/table";
import TableHeaderComponent from "./table-header";
import ColumnRowComponent from "./column-row";
import { ColumnRow } from "./types";
import { useColumnStorage } from "./hooks/useColumnStorage";
import { useColumnSort } from "./hooks/useColumnSort";
import { useColumnSelect } from "./hooks/useColumnSelect";
import { useColumnResize } from "./hooks/useColumnResize";
import { useColumnDrag } from "./hooks/useColumnDrag";
import { useFilterColumns } from "./hooks/useFilterColumns";

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
  
  useEffect(() => {
    setColumnRows(columns);
  }, [columns]);
  
  // Custom hooks for table functionality
  const { columnWidths, setColumnWidths, columnOrder, setColumnOrder } = useColumnStorage(columns);
  const { sortConfig, requestSort, getSortIndicator } = useColumnSort();
  const { toggleRowSelection, toggleAllSelection } = useColumnSelect(columnRows, setColumnRows);
  const { 
    resizing, 
    resizingColId, 
    handleResizeMouseDown, 
    handleResizeMouseMove, 
    handleResizeMouseUp 
  } = useColumnResize(columnWidths, setColumnWidths);
  const {
    draggedColumn,
    dragOverColumn,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  } = useColumnDrag(columnOrder, setColumnOrder);
  
  const columnRefs = React.useRef<{[key: string]: React.RefObject<HTMLTableCellElement>}>({
    id: React.createRef(),
    title: React.createRef(),
    type: React.createRef(),
    firstLine: React.createRef()
  });
  
  // Filter columns based on search term
  const filteredColumns = useFilterColumns(columnRows, searchTerm);
  
  // Sort columns based on sort configuration
  const sortedColumns = React.useMemo(() => {
    return [...filteredColumns].sort((a, b) => {
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
  }, [filteredColumns, sortConfig]);
  
  // Handle mouse move and up events for column resizing
  useEffect(() => {
    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [handleResizeMouseMove, handleResizeMouseUp]);

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableCaption>
          {showSubitems 
            ? `Subitems Structure - Total ${filteredColumns.length} Columns`
            : `Board Structure - Total ${filteredColumns.length} Columns`}
        </TableCaption>
        <TableHeader>
          <TableHeaderComponent 
            columnOrder={columnOrder}
            columnWidths={columnWidths}
            filteredColumns={filteredColumns}
            toggleAllSelection={() => toggleAllSelection(filteredColumns)}
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
          {filteredColumns.length === 0 ? (
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
