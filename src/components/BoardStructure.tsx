
import React, { useState } from "react";
import { ParsedBoardData, BoardColumn } from "@/lib/types";
import SearchBar from "./board/search-bar";
import ColumnsTable from "./board/columns-table";
import { ColumnRow } from "./board/types";

interface BoardStructureProps {
  boardData: ParsedBoardData;
}

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubitems, setShowSubitems] = useState(false);
  
  // Transform boardData columns to ColumnRow format based on showSubitems toggle
  const columnRows: ColumnRow[] = React.useMemo(() => {
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
      
      return {
        id: column.id,
        title: column.title,
        type: column.type,
        firstLineValue: example,
        itemId: itemId,
        itemName: itemName,
        selected: false
      };
    });
  }, [boardData, showSubitems]);
  
  // Count selected rows
  const selectedCount = columnRows.filter(col => col.selected).length;

  return (
    <div className="space-y-4">
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showSubitems={showSubitems}
        setShowSubitems={setShowSubitems}
        selectedCount={selectedCount}
      />
      
      <ColumnsTable 
        columns={columnRows}
        searchTerm={searchTerm}
        showSubitems={showSubitems}
      />
    </div>
  );
};

export default BoardStructure;
