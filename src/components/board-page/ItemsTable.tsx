
import React from "react";
import { BoardItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";
import TableEmptyState from "./items-table/TableEmptyState";
import SearchFilterBar from "./items-table/SearchFilterBar";
import TableContent from "./items-table/TableContent";
import TablePagination from "./items-table/TablePagination";
import { useItemsTable } from "./items-table/useItemsTable";

interface ItemsTableProps {
  items: BoardItem[];
  isLoading: boolean;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ items, isLoading }) => {
  const {
    searchTerm,
    showType,
    currentPage,
    filteredItems,
    currentItems,
    totalPages,
    startIndex,
    endIndex,
    itemTypeCount,
    subitemTypeCount,
    setSearchTerm,
    setShowType,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    setCurrentPage
  } = useItemsTable(items, isLoading);

  if (isLoading || items.length === 0) {
    return <TableEmptyState isLoading={isLoading} />;
  }

  return (
    <Card className="mb-6 overflow-x-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Items and Subitems
          </CardTitle>
          
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showType={showType}
            setShowType={setShowType}
            setCurrentPage={setCurrentPage}
            itemTypeCount={itemTypeCount}
            subitemTypeCount={subitemTypeCount}
            totalCount={items.length}
          />
        </div>
      </CardHeader>
      <CardContent>
        <TableContent 
          currentItems={currentItems} 
          itemsLength={items.length}
        />
        
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          filteredItemsLength={filteredItems.length}
          totalItemsLength={items.length}
          goToPage={goToPage}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
        />
      </CardContent>
    </Card>
  );
};

export default ItemsTable;
