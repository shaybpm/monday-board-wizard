
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table2, ListTree } from "lucide-react";
import React, { useEffect, useState } from 'react';

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
  // Add local state to ensure we have the correct value
  const [localShowSubitems, setLocalShowSubitems] = useState(showSubitems);
  
  // Sync local state with props
  useEffect(() => {
    if (localShowSubitems !== showSubitems) {
      setLocalShowSubitems(showSubitems);
    }
  }, [showSubitems]);
  
  console.log(`SearchBar rendered with showSubitems=${showSubitems}, localShowSubitems=${localShowSubitems}`);
  
  const handleItemsClick = () => {
    console.log("ITEMS button clicked - Setting showSubitems to FALSE");
    setLocalShowSubitems(false);
    setShowSubitems(false);
  };
  
  const handleSubitemsClick = () => {
    console.log("SUBITEMS button clicked - Setting showSubitems to TRUE");
    setLocalShowSubitems(true);
    setShowSubitems(true);
  };

  // Force a re-render whenever the showSubitems prop changes
  useEffect(() => {
    console.log(`SearchBar received prop update: showSubitems=${showSubitems}`);
  }, [showSubitems]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant={!localShowSubitems ? "default" : "outline"}
          className="flex items-center gap-1"
          onClick={handleItemsClick}
          data-testid="items-toggle-button"
        >
          <Table2 className="h-3.5 w-3.5" />
          <span>Items</span>
        </Button>
        <Button
          size="sm"
          variant={localShowSubitems ? "default" : "outline"}
          className="flex items-center gap-1"
          onClick={handleSubitemsClick}
          data-testid="subitems-toggle-button"
        >
          <ListTree className="h-3.5 w-3.5" />
          <span>Subitems</span>
        </Button>
        <div className="text-sm ml-2">
          {localShowSubitems ? "Subitems" : "Board"} Structure{" "}
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
