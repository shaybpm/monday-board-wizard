
import React, { useState } from "react";
import { ParsedBoardData } from "@/lib/types";
import SearchBar from "./board/search-bar";
import ColumnsTable from "./board/columns-table";
import { ColumnRow } from "./board/types";

interface BoardStructureProps {
  boardData: ParsedBoardData;
}

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubitems, setShowSubitems] = useState(false);
  
  // Transform boardData columns to ColumnRow format
  const columnRows: ColumnRow[] = boardData.columns.map(column => ({
    id: column.id,
    title: column.title,
    type: column.type,
    firstLineValue: column.exampleValue || "N/A",
    itemId: column.itemId || "N/A",
    itemName: column.itemName || "N/A",
    selected: false
  }));
  
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
