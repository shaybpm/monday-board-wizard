
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DebugItemsTableProps {
  items: any[];
  columns: Array<{id: string, title: string, type: string}>;
  isLoading: boolean;
}

const MAX_CELL_LENGTH = 50;

const DebugItemsTable: React.FC<DebugItemsTableProps> = ({ items, columns, isLoading }) => {
  if (isLoading) {
    return <div className="py-4 text-center">Loading debug data...</div>;
  }

  if (!items || items.length === 0) {
    return <div className="py-4 text-center">No items found to display.</div>;
  }

  const truncateText = (text: string) => {
    if (!text) return "—";
    return text.length > MAX_CELL_LENGTH 
      ? `${text.substring(0, MAX_CELL_LENGTH)}...` 
      : text;
  };

  const extractValue = (item: any, columnId: string) => {
    if (columnId === "name") {
      return item.name || "—";
    }
    
    if (columnId === "group") {
      return item.group?.title || "—";
    }
    
    const columnValue = item.column_values?.find((cv: any) => cv.id === columnId);
    return columnValue?.text || JSON.stringify(columnValue?.value || "").replace(/"/g, "") || "—";
  };

  console.log("Debug Items:", items);
  console.log("Debug Columns:", columns);

  return (
    <Card className="mt-6">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-medium">Debug Data - First {items.length} Items</h3>
        <p className="text-sm text-gray-500">
          Raw data from Monday.com API to help with debugging
        </p>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Data from Monday.com API</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead className="w-[120px]">Group</TableHead>
                {columns.slice(0, 5).map(column => (
                  <TableHead key={column.id} className="min-w-[150px]">
                    {column.title} <span className="text-xs text-gray-500">({column.type})</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.id}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{truncateText(item.name)}</span>
                      </TooltipTrigger>
                      <TooltipContent>{item.name}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{item.group?.title || "—"}</TableCell>
                  {columns.slice(0, 5).map(column => (
                    <TableCell key={`${item.id}-${column.id}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{truncateText(extractValue(item, column.id))}</span>
                        </TooltipTrigger>
                        <TooltipContent>{extractValue(item, column.id)}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default DebugItemsTable;
