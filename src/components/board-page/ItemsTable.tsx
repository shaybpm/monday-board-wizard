
import React from "react";
import { BoardItem } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

interface ItemsTableProps {
  items: BoardItem[];
  isLoading: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <p>Loading items...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No items available. Try fetching data first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-x-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Items 
          <span className="text-xs font-normal ml-2 text-muted-foreground">
            (showing {items.length} items)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">ID</TableHead>
                <TableHead className="w-1/4">Name</TableHead>
                <TableHead className="w-1/4">Group</TableHead>
                <TableHead className="w-1/4">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.groupTitle}</TableCell>
                  <TableCell>
                    <span className="px-1 py-0.5 bg-gray-100 rounded-sm text-xs">
                      {item.type}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsTable;
