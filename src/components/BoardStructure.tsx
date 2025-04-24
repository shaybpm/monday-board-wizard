
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
  
  // Debug logging to track what's happening
  useEffect(() => {
    console.log("BoardStructure render - showSubitems:", showSubitems);
    console.log("Has subitem columns:", boardData.subitemColumns?.length || 0);
    console.log("Has subitems:", boardData.subitems?.length || 0);
  }, [showSubitems, boardData]);
  
  // Function to build column rows based on view type
  const buildColumnRows = (showSubitemsValue: boolean) => {
    // Determine which columns to display based on view
    let columnsToDisplay;
    
    if (showSubitemsValue) {
      // SUBITEMS VIEW
      console.log("Building SUBITEMS column view");
      
      // Check if we have dedicated subitem columns
      if (boardData.subitemColumns && boardData.subitemColumns.length > 0) {
        console.log(`Using ${boardData.subitemColumns.length} dedicated subitem columns`);
        
        // Log what columns we're using
        boardData.subitemColumns.forEach(col => {
          console.log(`Subitem column: ${col.id}, title: ${col.title}, type: ${col.type}`);
        });
        
        columnsToDisplay = boardData.subitemColumns;
      } else if (boardData.subitems && boardData.subitems.length > 0) {
        // Fallback: extract columns from first subitem
        console.log("No dedicated subitem columns, extracting from subitem");
        const firstSubitem = boardData.subitems[0];
        
        if (firstSubitem && firstSubitem.columns) {
          console.log("Columns from first subitem:", Object.keys(firstSubitem.columns));
          
          const extractedColumns = Object.values(firstSubitem.columns).map(col => ({
            id: col.id,
            title: col.title || col.id,
            type: col.type || 'text',
            exampleValue: col.text || JSON.stringify(col.value) || "N/A",
            itemId: firstSubitem.id,
            itemName: firstSubitem.name
          }));
          
          console.log(`Extracted ${extractedColumns.length} columns from subitem`);
          columnsToDisplay = extractedColumns;
        } else {
          // No columns in subitems, fallback to main
          console.log("No columns in subitems, falling back to main columns");
          columnsToDisplay = boardData.columns;
        }
      } else {
        // No subitems data available
        console.log("No subitems data available, falling back to main columns");
        columnsToDisplay = boardData.columns;
      }
    } else {
      // ITEMS VIEW - use regular board columns
      console.log("Building ITEMS column view");
      columnsToDisplay = boardData.columns;
    }
    
    // Convert columns to the ColumnRow format that the table expects
    const newColumnRows = columnsToDisplay.map(column => {
      // Try to find if this column was already in the existing rows (to preserve selection)
      const existingColumn = columnRows.find(c => c.id === column.id);
      const isSelected = existingColumn 
        ? existingColumn.selected 
        : initialSelectedColumns.includes(column.id);
      
      return {
        id: column.id,
        title: column.title || column.id,
        type: column.type || 'text',
        firstLineValue: column.exampleValue || "N/A",
        itemId: column.itemId || "N/A",
        itemName: column.itemName || "N/A",
        selected: isSelected
      };
    });
    
    console.log(`Built ${newColumnRows.length} column rows with showSubitems=${showSubitemsValue}`);
    return newColumnRows;
  };

  // Handle the toggle between items and subitems with a key change to force re-render
  const handleShowSubitemsChange = (show: boolean) => {
    console.log(`Toggle request: ${showSubitems} -> ${show}`);
    
    if (showSubitems !== show) {
      console.log(`Switching to ${show ? 'SUBITEMS' : 'ITEMS'} view`);
      
      // Update column rows IMMEDIATELY
      const newRows = buildColumnRows(show);
      setColumnRows(newRows);
      
      // Then update the state for future reference
      setShowSubitems(show);
      
      toast.info(`Switched to ${show ? 'Subitems' : 'Items'} view`);
    }
  };
  
  // Rebuild column rows when board data changes
  useEffect(() => {
    console.log("Board data changed - rebuilding column rows");
    const newRows = buildColumnRows(showSubitems);
    setColumnRows(newRows);
  }, [boardData, initialSelectedColumns]);
  
  const { toggleRowSelection, toggleAllSelection } = useColumnSelect(columnRows, setColumnRows);
  
  const selectedCount = columnRows.filter(col => col.selected).length;
  
  // Report selected columns back to parent when they change
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
        key={`columns-table-${showSubitems ? 'subitems' : 'items'}`}
      />
    </div>
  );
};

export default BoardStructure;
