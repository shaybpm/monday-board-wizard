
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
  // Add local state to track button states more reliably
  const [activeView, setActiveView] = useState(showSubitems ? 'subitems' : 'items');
  
  // Sync parent state with local state
  useEffect(() => {
    const newActiveView = showSubitems ? 'subitems' : 'items';
    if (activeView !== newActiveView) {
      console.log(`SearchBar - syncing local activeView state with parent state: ${newActiveView}`);
      setActiveView(newActiveView);
    }
  }, [showSubitems, activeView]);
  
  // Effect to log state changes for debugging
  useEffect(() => {
    console.log(`SearchBar - current view state: activeView=${activeView}, showSubitems=${showSubitems}`);
  }, [activeView, showSubitems]);
  
  const handleItemsClick = () => {
    console.log("ITEMS button clicked");
    setActiveView('items');
    setShowSubitems(false);
  };
  
  const handleSubitemsClick = () => {
    console.log("SUBITEMS button clicked");
    setActiveView('subitems');
    setShowSubitems(true);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant={activeView === 'items' ? "default" : "outline"}
          className="flex items-center gap-1"
          onClick={handleItemsClick}
          data-testid="items-toggle-button"
        >
          <Table2 className="h-3.5 w-3.5" />
          <span>Items</span>
        </Button>
        <Button
          size="sm"
          variant={activeView === 'subitems' ? "default" : "outline"}
          className="flex items-center gap-1"
          onClick={handleSubitemsClick}
          data-testid="subitems-toggle-button"
        >
          <ListTree className="h-3.5 w-3.5" />
          <span>Subitems</span>
        </Button>
        <div className="text-sm ml-2">
          {activeView === 'subitems' ? "Subitems" : "Board"} Structure{" "}
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
