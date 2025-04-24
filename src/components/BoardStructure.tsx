
import React, { useState, useEffect } from "react";
import { ParsedBoardData } from "@/lib/types";
import SearchBar from "./board/search-bar";
import ColumnsTable from "./board/columns-table";
import { ColumnRow } from "./board/types";
import { useColumnSelect } from "./board/hooks/useColumnSelect";
import { toast } from "sonner";

interface BoardStructureProps {
  boardData: ParsedBoardData;
  onColumnSelection?: (columnIds: string[]) => void;
  initialSelectedColumns?: string[];
}

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData, onColumnSelection, initialSelectedColumns = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubitems, setShowSubitems] = useState(false);
  const [columnRows, setColumnRows] = useState<ColumnRow[]>([]);
  
  // Completely rewrite the handler to be more direct
  const handleShowSubitemsChange = (show: boolean) => {
    console.log(`BoardStructure - setShowSubitems called with value: ${show}`);
    setShowSubitems(show);
    
    // Notify user of the change
    toast.info(`View changed to ${show ? 'Subitems' : 'Items'}`);
  };
  
  // Rebuild column rows whenever showSubitems changes or board data updates
  useEffect(() => {
    console.log(`Rebuilding column rows with showSubitems=${showSubitems}`);
    
    let columnsToDisplay;
    
    if (showSubitems && boardData.subitemColumns && boardData.subitemColumns.length > 0) {
      console.log("Using subitem columns:", boardData.subitemColumns.length);
      columnsToDisplay = boardData.subitemColumns;
    } else {
      console.log("Using main board columns:", boardData.columns.length);
      columnsToDisplay = boardData.columns;
    }
    
    const newColumnRows = columnsToDisplay.map(column => {
      let example = column.exampleValue || "N/A";
      let itemId = column.itemId || "N/A";
      let itemName = column.itemName || "N/A";
      
      // When showing subitems but no subitem columns are available,
      // try to find examples from subitems data
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
    
  }, [showSubitems, boardData]);
  
  // Handle initial selected columns
  useEffect(() => {
    if (initialSelectedColumns && initialSelectedColumns.length > 0) {
      console.log("Setting initial column selection:", initialSelectedColumns.length);
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
      <div key={`search-bar-${showSubitems}`}>
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showSubitems={showSubitems}
          setShowSubitems={handleShowSubitemsChange}
          selectedCount={selectedCount}
        />
      </div>
      
      <div key={`columns-table-${showSubitems}`}>
        <ColumnsTable 
          columns={columnRows}
          searchTerm={searchTerm}
          showSubitems={showSubitems}
          onToggleRowSelection={toggleRowSelection}
          onToggleAllSelection={toggleAllSelection}
        />
      </div>
    </div>
  );
};

export default BoardStructure;
