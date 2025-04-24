
import React from "react";
import { Search, ListTree, Table2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showSubitems: boolean;
  setShowSubitems: (show: boolean) => void;
  selectedCount: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  showSubitems,
  setShowSubitems,
  selectedCount
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {showSubitems ? <ListTree className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {showSubitems ? "Subitems" : "Items"}
              </span>
              <Switch
                checked={showSubitems}
                onCheckedChange={setShowSubitems}
              />
            </div>
            
            <Button
              variant="outline"
              disabled={selectedCount === 0}
              className="whitespace-nowrap"
            >
              Selected ({selectedCount})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchBar;
