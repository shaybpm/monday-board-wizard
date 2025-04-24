
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table2, ListTree } from "lucide-react";
import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showSubitems: boolean;
  setShowSubitems: (show: boolean) => void;
  selectedCount: number;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  showSubitems,
  setShowSubitems,
  selectedCount
}: SearchBarProps) {
  const handleItemsClick = () => {
    console.log("ITEMS button clicked");
    setShowSubitems(false);
  };
  
  const handleSubitemsClick = () => {
    console.log("SUBITEMS button clicked");
    setShowSubitems(true);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant={showSubitems ? "outline" : "default"}
          className="flex items-center gap-1"
          onClick={handleItemsClick}
          data-testid="items-toggle-button"
        >
          <Table2 className="h-3.5 w-3.5" />
          <span>Items</span>
        </Button>
        <Button
          size="sm"
          variant={showSubitems ? "default" : "outline"}
          className="flex items-center gap-1"
          onClick={handleSubitemsClick}
          data-testid="subitems-toggle-button"
        >
          <ListTree className="h-3.5 w-3.5" />
          <span>Subitems</span>
        </Button>
        <div className="text-sm ml-2">
          {showSubitems ? "Subitems" : "Board"} Structure{" "}
          {selectedCount > 0 && (
            <span>
              - Selected <strong>{selectedCount}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="relative flex-grow max-w-xs">
        <Input
          type="search"
          placeholder="Search columns..."
          className="w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
