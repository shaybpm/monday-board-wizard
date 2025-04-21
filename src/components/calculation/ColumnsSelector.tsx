
import React from "react";
import { Badge } from "@/components/ui/badge";
import { BoardColumn } from "@/lib/types";
import { SectionHeader } from "./formula-display/SectionHeader";

interface ColumnsSelectorProps {
  columns: BoardColumn[];
  onSelectColumn: (column: BoardColumn) => void;
}

const ColumnsSelector: React.FC<ColumnsSelectorProps> = ({ 
  columns, 
  onSelectColumn 
}) => {
  // Add debugging log to check what columns are being received
  console.log("ColumnsSelector received columns:", columns);
  
  return (
    <div className="space-y-2">
      <SectionHeader label="Available Columns" />
      
      <div className="p-4 border rounded-md bg-white min-h-16">
        {columns && columns.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {columns.map(column => (
              <Badge 
                key={column.id}
                variant="outline" 
                className="px-3 py-1 cursor-pointer hover:bg-blue-50"
                onClick={() => onSelectColumn(column)}
              >
                {column.title}
                <span className="ml-1 text-xs text-gray-500">({column.type})</span>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            No columns available. Please go back and select columns from the board page.
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnsSelector;
