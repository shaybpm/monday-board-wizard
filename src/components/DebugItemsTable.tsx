
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
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface DebugItemsTableProps {
  items: any[];
  columns: Array<{id: string, title: string, type: string}>;
  isLoading: boolean;
}

const MAX_CELL_LENGTH = 50;
const DEFAULT_COLUMNS_TO_SHOW = 10;

const DebugItemsTable: React.FC<DebugItemsTableProps> = ({ items, columns, isLoading }) => {
  const [columnOffset, setColumnOffset] = React.useState(0);
  
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

  const visibleColumns = columns.slice(columnOffset, columnOffset + DEFAULT_COLUMNS_TO_SHOW);
  const canScrollLeft = columnOffset > 0;
  const canScrollRight = columnOffset + DEFAULT_COLUMNS_TO_SHOW < columns.length;
  
  const handleScrollLeft = () => {
    setColumnOffset(Math.max(0, columnOffset - 5));
  };
  
  const handleScrollRight = () => {
    setColumnOffset(Math.min(columns.length - DEFAULT_COLUMNS_TO_SHOW, columnOffset + 5));
  };

  return (
    <Card className="mt-6">
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Debug Data - First {items.length} Items</h3>
            <p className="text-sm text-gray-500">
              Raw data from Monday.com API to help with debugging
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Scroll left</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Scroll right</span>
            </Button>
            <span className="text-xs text-muted-foreground">
              Showing columns {columnOffset+1} to {Math.min(columnOffset+DEFAULT_COLUMNS_TO_SHOW, columns.length)} of {columns.length}
            </span>
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[600px]">
        <div className="w-full overflow-auto">
          <Table>
            <TableCaption>Data from Monday.com API</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] sticky left-0 bg-white z-10">ID</TableHead>
                <TableHead className="w-[200px] sticky left-[80px] bg-white z-10">Name</TableHead>
                <TableHead className="w-[120px] sticky left-[280px] bg-white z-10">Group</TableHead>
                {visibleColumns.map(column => (
                  <TableHead key={column.id} className="min-w-[150px]">
                    {column.title} <span className="text-xs text-gray-500">({column.type})</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono sticky left-0 bg-white z-10">{item.id}</TableCell>
                  <TableCell className="sticky left-[80px] bg-white z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{truncateText(item.name)}</span>
                      </TooltipTrigger>
                      <TooltipContent>{item.name}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="sticky left-[280px] bg-white z-10">{item.group?.title || "—"}</TableCell>
                  {visibleColumns.map(column => (
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
