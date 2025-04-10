
import React from "react";
import { BoardColumn } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, List, ListTree } from "lucide-react";

interface DebugItemsTableProps {
  items: any[];
  columns: BoardColumn[];
  isLoading: boolean;
  type?: 'items' | 'subitems';
}

const DebugItemsTable: React.FC<DebugItemsTableProps> = ({ 
  items, 
  columns,
  isLoading,
  type = 'items'
}) => {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading debug data...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === 'items' ? <List className="h-5 w-5" /> : <ListTree className="h-5 w-5" />}
            Debug {type === 'items' ? 'Items' : 'Subitems'} 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No {type} data available. 
            {type === 'subitems' && " Make sure your board contains subitems."}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Display the first item/subitem
  const firstItem = items[0];
  const parentInfo = type === 'subitems' && firstItem.parent_item 
    ? { id: firstItem.parent_item.id, name: firstItem.parent_item.name }
    : null;

  return (
    <Card className="mb-6 overflow-x-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'items' ? <List className="h-5 w-5" /> : <ListTree className="h-5 w-5" />}
          Debug {type === 'items' ? 'Items' : 'Subitems'} 
          <span className="text-xs font-normal ml-2 text-muted-foreground">
            (showing first {items.length} {items.length === 1 ? type.slice(0, -1) : type})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {parentInfo && (
          <div className="mb-4 p-2 bg-gray-50 rounded-md border">
            <div className="text-sm font-medium">Parent Item: {parentInfo.name}</div>
            <div className="text-xs text-muted-foreground">ID: {parentInfo.id}</div>
          </div>
        )}
        
        <div className="text-sm font-medium mb-2">
          Item: {firstItem.name}  
          <span className="text-xs ml-2 text-muted-foreground">
            (ID: {firstItem.id})
          </span>
        </div>
        
        {firstItem.group && (
          <div className="text-xs mb-4 text-muted-foreground">
            Group: {firstItem.group.title} (ID: {firstItem.group.id})
          </div>
        )}
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Column ID</TableHead>
                <TableHead className="w-48">Column Type</TableHead>
                <TableHead className="w-1/3">Text</TableHead>
                <TableHead className="w-1/3">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {firstItem.column_values.map((columnValue: any) => {
                // Find corresponding column definition
                const columnDef = columns.find(c => c.id === columnValue.id);
                
                return (
                  <TableRow key={columnValue.id}>
                    <TableCell className="font-mono text-xs">
                      {columnValue.id}
                    </TableCell>
                    <TableCell>
                      <span className="px-1 py-0.5 bg-gray-100 rounded-sm text-xs">
                        {columnValue.type || (columnDef ? columnDef.type : "unknown")}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md break-all">
                      {columnValue.text !== null && columnValue.text !== undefined 
                        ? columnValue.text 
                        : <span className="text-muted-foreground italic">null</span>}
                    </TableCell>
                    <TableCell className="max-w-md overflow-hidden">
                      <div className="max-h-20 overflow-y-auto">
                        {columnValue.value !== null && columnValue.value !== undefined 
                          ? <pre className="text-xs whitespace-pre-wrap">{columnValue.value}</pre> 
                          : <span className="text-muted-foreground italic">null</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugItemsTable;
