
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

interface TableContentProps {
  currentItems: BoardItem[];
  itemsLength: number;
}

const TableContent: React.FC<TableContentProps> = ({ currentItems, itemsLength }) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">ID</TableHead>
            <TableHead className="w-1/3">Name</TableHead>
            <TableHead className="w-1/5">Group / Parent</TableHead>
            <TableHead className="w-1/5">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                No matching items found
              </TableCell>
            </TableRow>
          ) : (
            currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  {item.type === "item" ? (
                    item.groupTitle || "No group"
                  ) : (
                    <span className="text-xs">Parent ID: {item.parentId}</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-1 py-0.5 rounded-sm text-xs ${
                    item.type === "item" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {item.type}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableContent;
