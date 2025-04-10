
import { useMemo } from "react";
import { ColumnRow } from "../types";

export const useFilterColumns = (columnRows: ColumnRow[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm) return columnRows;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return columnRows.filter(column => {
      return (
        column.id.toLowerCase().includes(lowerSearchTerm) ||
        column.title.toLowerCase().includes(lowerSearchTerm) ||
        column.type.toLowerCase().includes(lowerSearchTerm) ||
        (column.firstLineValue && column.firstLineValue.toLowerCase().includes(lowerSearchTerm)) ||
        (column.itemId && column.itemId.toLowerCase().includes(lowerSearchTerm)) ||
        (column.itemName && column.itemName.toLowerCase().includes(lowerSearchTerm))
      );
    });
  }, [columnRows, searchTerm]);
};
