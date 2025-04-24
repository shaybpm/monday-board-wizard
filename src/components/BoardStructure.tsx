
import React, { useState, useCallback, useEffect } from "react";
import { ParsedBoardData, BoardColumn } from "@/lib/types";
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
  
  // Transform boardData columns to ColumnRow format based on showSubitems toggle
  const [columnRows, setColumnRows] = useState<ColumnRow[]>(() => {
    // If showing subitems and we have subitem columns data, use that instead of regular columns
    const columnsToDisplay = (showSubitems && boardData.subitemColumns) 
      ? boardData.subitemColumns 
      : boardData.columns;
    
    return columnsToDisplay.map(column => {
      let example = column.exampleValue || "N/A";
      let itemId = column.itemId || "N/A";
      let itemName = column.itemName || "N/A";
      
      // If we have subitems and the toggle is on, try to get example values from subitems
      if (showSubitems && boardData.subitems && boardData.subitems.length > 0 && !boardData.subitemColumns) {
        // Find the first subitem that has a value for this column
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
      
      // Mark columns as selected if they are in the initialSelectedColumns array
      const isSelected = initialSelectedColumns.includes(column.id);
      
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
  });
  
  // Update columns when showSubitems changes
  useEffect(() => {
    // Get the columns to display based on the toggle
    const columnsToDisplay = (showSubitems && boardData.subitemColumns) 
      ? boardData.subitemColumns 
      : boardData.columns;
    
    console.log("Toggle changed: showing", showSubitems ? "subitems" : "items");
    console.log("Columns to display:", columnsToDisplay);
    
    // Map columns to ColumnRow format
    const newColumnRows = columnsToDisplay.map(column => {
      let example = column.exampleValue || "N/A";
      let itemId = column.itemId || "N/A";
      let itemName = column.itemName || "N/A";
      
      // If we're showing subitems and don't have specific subitem columns, try to get examples from subitems
      if (showSubitems && boardData.subitems && boardData.subitems.length > 0 && !boardData.subitemColumns) {
        // Find the first subitem that has a value for this column
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
      
      // Preserve selection state for columns that exist in both views
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
    
    console.log("Setting new column rows:", newColumnRows.length);
    setColumnRows(newColumnRows);
  }, [showSubitems, boardData.columns, boardData.subitemColumns, boardData.subitems, initialSelectedColumns]);
  
  // Apply initial selection when component mounts or initialSelectedColumns changes
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
  
  // Count selected rows
  const selectedCount = columnRows.filter(col => col.selected).length;
  
  // Update parent component when selections change
  useEffect(() => {
    if (onColumnSelection) {
      const selectedColumnIds = columnRows
        .filter(col => col.selected)
        .map(col => col.id);
      onColumnSelection(selectedColumnIds);
    }
  }, [columnRows, onColumnSelection]);

  const handleToggleSubitems = useCallback((value: boolean) => {
    console.log("Toggle subitems called with value:", value);
    setShowSubitems(value);
  }, []);

  return (
    <div className="space-y-4">
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showSubitems={showSubitems}
        setShowSubitems={handleToggleSubitems}
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
