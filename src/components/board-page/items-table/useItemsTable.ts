
import { useState, useMemo } from "react";
import { BoardItem } from "@/lib/types";

interface ItemsTableState {
  searchTerm: string;
  showType: "all" | "item" | "subitem";
  currentPage: number;
  pageSize: number;
  filteredItems: BoardItem[];
  currentItems: BoardItem[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
  itemTypeCount: number;
  subitemTypeCount: number;
}

interface ItemsTableActions {
  setSearchTerm: (term: string) => void;
  setShowType: (type: "all" | "item" | "subitem") => void;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  setCurrentPage: (page: number) => void;
}

export const useItemsTable = (
  items: BoardItem[],
  isLoading: boolean
): ItemsTableState & ItemsTableActions => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showType, setShowType] = useState<"all" | "item" | "subitem">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25; // Show 25 items per page
  
  // Calculate counts for display
  const itemTypeCount = items.filter(item => item.type === "item").length;
  const subitemTypeCount = items.filter(item => item.type === "subitem").length;
  
  // Filter items based on search term and type
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = showType === "all" || item.type === showType;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, showType]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = filteredItems.slice(startIndex, endIndex);
  
  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return {
    searchTerm,
    showType,
    currentPage,
    pageSize,
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
  };
};
