
import { ColumnRow } from "../types";

export const useColumnSelect = (
  columnRows: ColumnRow[],
  setColumnRows: React.Dispatch<React.SetStateAction<ColumnRow[]>>
) => {
  const toggleRowSelection = (id: string) => {
    setColumnRows(rows => 
      rows.map(row => 
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    );
  };
  
  const toggleAllSelection = (filteredColumns: ColumnRow[] = columnRows) => {
    const allSelected = filteredColumns.every(col => col.selected);
    setColumnRows(rows => 
      rows.map(row => {
        if (filteredColumns.some(col => col.id === row.id)) {
          return { ...row, selected: !allSelected };
        }
        return row;
      })
    );
  };
  
  return {
    toggleRowSelection,
    toggleAllSelection
  };
};
