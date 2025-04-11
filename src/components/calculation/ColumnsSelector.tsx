
import React from "react";
import { Badge } from "@/components/ui/badge";
import { BoardColumn } from "@/lib/types";

interface ColumnsSelectorProps {
  columns: BoardColumn[];
  onSelectColumn: (column: BoardColumn) => void;
}

const ColumnsSelector: React.FC<ColumnsSelectorProps> = ({ 
  columns, 
  onSelectColumn 
}) => {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Available Columns</h3>
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
    </div>
  );
};

export default ColumnsSelector;
