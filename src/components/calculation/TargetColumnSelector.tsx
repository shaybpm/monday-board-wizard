
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoardColumn } from "@/lib/types";

interface TargetColumnSelectorProps {
  columns: BoardColumn[];
  targetColumn: BoardColumn | null;
  onSelectTarget: (column: BoardColumn) => void;
}

const TargetColumnSelector: React.FC<TargetColumnSelectorProps> = ({
  columns,
  targetColumn,
  onSelectTarget
}) => {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Store Result In</h3>
      <div className="p-4 border rounded-md bg-gray-50 min-h-16 flex items-center">
        {targetColumn ? (
          <Badge className="px-3 py-1">
            {targetColumn.title}
            <span className="ml-1 text-xs text-gray-500">({targetColumn.type})</span>
          </Badge>
        ) : (
          <span className="text-gray-400">Select a target column for the result</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {columns.map(column => (
          <Button 
            key={column.id} 
            variant="outline" 
            size="sm"
            onClick={() => onSelectTarget(column)}
          >
            {column.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TargetColumnSelector;
