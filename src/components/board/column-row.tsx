
import React from "react";
import { CheckSquare, Square } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TableRow, TableCell } from "@/components/ui/table";
import { ColumnRow } from "./types";

interface ColumnRowProps {
  column: ColumnRow;
  columnWidths: Record<string, number>;
  columnOrder: string[];
  toggleRowSelection: (id: string) => void;
}

const ColumnRowComponent: React.FC<ColumnRowProps> = ({ 
  column, 
  columnWidths, 
  columnOrder,
  toggleRowSelection
}) => {
  return (
    <TableRow className={`${column.selected ? 'bg-blue-50' : ''} h-6`}>
      <TableCell className="text-center p-0 w-10">
        <div 
          className="cursor-pointer inline-flex"
          onClick={() => toggleRowSelection(column.id)}
        >
          {column.selected ? (
            <CheckSquare className="h-4 w-4 text-blue-600" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </div>
      </TableCell>
      {columnOrder.map((columnKey) => {
        if (columnKey === 'id') {
          return (
            <TableCell 
              key={`${column.id}-id`}
              style={{ 
                width: `${columnWidths.id || 100}px`,
                maxWidth: `${columnWidths.id || 100}px`
              }}
              className="font-mono text-xs p-1 truncate"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate inline-block w-full" title={column.id}>
                    {column.id}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{column.id}</TooltipContent>
              </Tooltip>
            </TableCell>
          );
        }
        if (columnKey === 'title') {
          return (
            <TableCell 
              key={`${column.id}-title`}
              style={{ 
                width: `${columnWidths.title || 150}px`,
                maxWidth: `${columnWidths.title || 150}px`
              }}
              className="p-1 truncate"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate inline-block w-full" title={column.title}>
                    {column.title}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{column.title}</TooltipContent>
              </Tooltip>
            </TableCell>
          );
        }
        if (columnKey === 'type') {
          return (
            <TableCell 
              key={`${column.id}-type`}
              style={{ 
                width: `${columnWidths.type || 100}px`,
                maxWidth: `${columnWidths.type || 100}px`
              }}
              className="p-1"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="px-1 py-0 bg-gray-100 rounded-md text-xs truncate inline-block w-full" title={column.type}>
                    {column.type}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{column.type}</TooltipContent>
              </Tooltip>
            </TableCell>
          );
        }
        if (columnKey === 'firstLine') {
          // Display item name if it's the "name" column, otherwise display the value
          const displayValue = column.id === "name" 
            ? (column.itemName || "N/A") 
            : (column.firstLineValue || "N/A");
          
          return (
            <TableCell 
              key={`${column.id}-firstLine`}
              style={{ 
                width: `${columnWidths.firstLine || 120}px`,
                maxWidth: `${columnWidths.firstLine || 120}px`
              }}
              className="p-1 truncate"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate inline-block w-full" title={displayValue}>
                    {displayValue}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div>{displayValue}</div>
                </TooltipContent>
              </Tooltip>
            </TableCell>
          );
        }
        return null;
      })}
    </TableRow>
  );
};

export default ColumnRowComponent;
