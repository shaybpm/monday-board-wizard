
import React, { useState, useEffect } from "react";
import { ParsedBoardData } from "@/lib/types";
import SearchBar from "./board/search-bar";
import ColumnsTable from "./board/columns-table";
import { ColumnRow } from "./board/types";
import { useColumnSelect } from "./board/hooks/useColumnSelect";

interface BoardStructureProps {
  boardData: ParsedBoardData;
  onColumnSelection?: (columnIds: string[]) => void;
  initialSelectedColumns?: string[];
}

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData, onColumnSelection, initialSelectedColumns = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubitems, setShowSubitems] = useState(false);
  const [columnRows, setColumnRows] = useState<ColumnRow[]>([]);
  
  // Simplify the structure toggle handler - this was a primary source of the issue
  const handleShowSubitemsChange = (showSubitemsValue: boolean) => {
    console.log(`BoardStructure - Setting showSubitems to ${showSubitemsValue}`);
    setShowSubitems(showSubitemsValue);
  };
  
  // Initial setup and when toggling between items/subitems
  useEffect(() => {
    console.log(`Rebuilding column rows with showSubitems=${showSubitems}`);
    
    const columnsToDisplay = showSubitems && boardData.subitemColumns
      ? boardData.subitemColumns 
      : boardData.columns;
    
    const newColumnRows = columnsToDisplay.map(column => {
      let example = column.exampleValue || "N/A";
      let itemId = column.itemId || "N/A";
      let itemName = column.itemName || "N/A";
      
      if (showSubitems && boardData.subitems && boardData.subitems.length > 0 && !boardData.subitemColumns) {
        const subitemWithValue = boardData.subitems.find(subitem => {
          return subitem.columns && subitem.columns[column.id] && 
            (subitem.columns[column.id].text || subitem.columns[column.id].value);
        });
        
        if (subitemWithValue) {
          example = subitemWithValue.columns[column.id].text || 
                    JSON.stringify(subitemWithValue.columns[column.id].value) || 
                    "N/A";
          itemId = subitemWithValue.id || "N/A";
          itemName = subitemWithValue.name || "N/A";
        }
      }
      
      const existingColumn = columnRows.find(c => c.id === column.id);
      const isSelected = existingColumn 
        ? existingColumn.selected 
        : initialSelectedColumns.includes(column.id);
      
      return {
        id: column.id,
        title: column.title,
        type: column.type,
        firstLineValue: example,
        itemId: itemId,
        itemName: itemName,
        selected: isSelected
      };
    });
    
    console.log(`Setting ${newColumnRows.length} column rows, showSubitems=${showSubitems}`);
    setColumnRows(newColumnRows);
    
  }, [showSubitems, boardData.columns, boardData.subitemColumns, boardData.subitems, initialSelectedColumns]);
  
  // Handle initial selected columns
  useEffect(() => {
    if (initialSelectedColumns && initialSelectedColumns.length > 0) {
      setColumnRows(prev => 
        prev.map(col => ({
          ...col,
          selected: initialSelectedColumns.includes(col.id)
        }))
      );
    }
  }, [initialSelectedColumns]);
  
  const { toggleRowSelection, toggleAllSelection } = useColumnSelect(columnRows, setColumnRows);
  
  const selectedCount = columnRows.filter(col => col.selected).length;
  
  useEffect(() => {
    if (onColumnSelection) {
      const selectedColumnIds = columnRows
        .filter(col => col.selected)
        .map(col => col.id);
      onColumnSelection(selectedColumnIds);
    }
  }, [columnRows, onColumnSelection]);

  return (
    <div className="space-y-4">
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showSubitems={showSubitems}
        setShowSubitems={handleShowSubitemsChange}
        selectedCount={selectedCount}
      />
      
      <ColumnsTable 
        columns={columnRows}
        searchTerm={searchTerm}
        showSubitems={showSubitems}
        onToggleRowSelection={toggleRowSelection}
        onToggleAllSelection={toggleAllSelection}
      />
    </div>
  );
};

export default BoardStructure;
