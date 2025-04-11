
import React, { useState } from "react";
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
import { List, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ItemsTableProps {
  items: BoardItem[];
  isLoading: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showType, setShowType] = useState<"all" | "item" | "subitem">("all");
  
  // Filter items based on search term and type
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = showType === "all" || item.type === showType;
    return matchesSearch && matchesType;
  });
  
  const itemTypeCount = items.filter(item => item.type === "item").length;
  const subitemTypeCount = items.filter(item => item.type === "subitem").length;

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
            No items available. Try fetching data first by clicking "Fetch All Board Data".
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-x-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Items and Subitems
            <span className="text-xs font-normal ml-2 text-muted-foreground">
              ({items.length} total: {itemTypeCount} items, {subitemTypeCount} subitems)
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1">
              <ListFilter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={showType === "all" ? "default" : "outline"}
                onClick={() => setShowType("all")}
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={showType === "item" ? "default" : "outline"}
                onClick={() => setShowType("item")}
              >
                Items
              </Button>
              <Button 
                size="sm" 
                variant={showType === "subitem" ? "default" : "outline"}
                onClick={() => setShowType("subitem")}
              >
                Subitems
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No matching items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
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
        {filteredItems.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2 text-right">
            Showing {filteredItems.length} of {items.length} items
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemsTable;
