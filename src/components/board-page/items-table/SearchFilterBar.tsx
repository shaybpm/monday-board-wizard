
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListFilter } from "lucide-react";

interface SearchFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showType: "all" | "item" | "subitem";
  setShowType: (type: "all" | "item" | "subitem") => void;
  setCurrentPage: (page: number) => void;
  itemTypeCount: number;
  subitemTypeCount: number;
  totalCount: number;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  showType,
  setShowType,
  setCurrentPage,
  itemTypeCount,
  subitemTypeCount,
  totalCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-normal text-muted-foreground">
          ({totalCount} total: {itemTypeCount} items, {subitemTypeCount} subitems)
        </span>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1">
          <ListFilter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant={showType === "all" ? "default" : "outline"}
            onClick={() => {
              setShowType("all");
              setCurrentPage(1); // Reset to first page when changing filter
            }}
          >
            All
          </Button>
          <Button 
            size="sm" 
            variant={showType === "item" ? "default" : "outline"}
            onClick={() => {
              setShowType("item");
              setCurrentPage(1); // Reset to first page when changing filter
            }}
          >
            Items
          </Button>
          <Button 
            size="sm" 
            variant={showType === "subitem" ? "default" : "outline"}
            onClick={() => {
              setShowType("subitem");
              setCurrentPage(1); // Reset to first page when changing filter
            }}
          >
            Subitems
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
