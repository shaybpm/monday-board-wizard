
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  filteredItemsLength: number;
  totalItemsLength: number;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  filteredItemsLength,
  totalItemsLength,
  goToPage,
  goToPreviousPage,
  goToNextPage,
}) => {
  const getPaginationItems = () => {
    const pages = [];
    
    // Show first page
    if (currentPage > 2) {
      pages.push(
        <PaginationItem key="page-1">
          <PaginationLink 
            isActive={currentPage === 1} 
            onClick={() => goToPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis-1">
          <span className="px-2">...</span>
        </PaginationItem>
      );
    }
    
    // Show current page and surrounding pages
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      pages.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={currentPage === i} 
            onClick={() => goToPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis-2">
          <span className="px-2">...</span>
        </PaginationItem>
      );
    }
    
    // Show last page
    if (currentPage < totalPages - 1 && totalPages > 1) {
      pages.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => goToPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pages;
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
      <div className="text-xs text-muted-foreground">
        Showing {Math.min(filteredItemsLength, startIndex + 1)}-{Math.min(filteredItemsLength, endIndex)} 
        of {filteredItemsLength} filtered items 
        (from total {totalItemsLength} items)
      </div>
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious onClick={goToPreviousPage} />
              </PaginationItem>
            )}
            
            {getPaginationItems()}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext onClick={goToNextPage} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default TablePagination;
