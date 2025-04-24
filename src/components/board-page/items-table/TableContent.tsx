
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
            <TableHead className="w-1/6">ID</TableHead>
            <TableHead className="w-1/3">Name</TableHead>
            <TableHead className="w-1/4">Group / Parent</TableHead>
            <TableHead className="w-1/6">Type</TableHead>
            <TableHead className="w-1/6">Columns</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
                    <span>
                      {item.groupTitle || "No group"}
                      {item.groupId && (
                        <span className="text-xs ml-1 text-muted-foreground">
                          (ID: {item.groupId})
                        </span>
                      )}
                    </span>
                  ) : (
                    <div>
                      <span className="text-xs block">Parent ID: {item.parentId}</span>
                      {/* Could add parent name lookup here if available */}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-sm text-xs ${
                    item.type === "item" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {item.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {Object.keys(item.columns).length} columns
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
