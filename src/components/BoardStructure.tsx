
import React, { useState } from "react";
import { ParsedBoardData } from "@/lib/types";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, CheckSquare, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BoardStructureProps {
  boardData: ParsedBoardData;
}

interface ColumnRow {
  id: string;
  title: string;
  type: string;
  selected: boolean;
}

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnRows, setColumnRows] = useState<ColumnRow[]>(
    boardData.columns.map(column => ({
      id: column.id,
      title: column.title,
      type: column.type,
      selected: false
    }))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ColumnRow;
    direction: "ascending" | "descending" | null;
  }>({ key: "id", direction: null });
  
  // Filter columns based on search term
  const filteredColumns = columnRows.filter(column => {
    if (!searchTerm) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      column.id.toLowerCase().includes(lowerSearchTerm) ||
      column.title.toLowerCase().includes(lowerSearchTerm) ||
      column.type.toLowerCase().includes(lowerSearchTerm)
    );
  });
  
  // Sort columns
  const sortedColumns = [...filteredColumns].sort((a, b) => {
    if (sortConfig.direction === null) {
      return 0;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });
  
  const requestSort = (key: keyof ColumnRow) => {
    let direction: "ascending" | "descending" | null = "ascending";
    
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (sortConfig.key === key && sortConfig.direction === "descending") {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof ColumnRow) => {
    if (sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };
  
  const toggleRowSelection = (id: string) => {
    setColumnRows(rows => 
      rows.map(row => 
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    );
  };
  
  const toggleAllSelection = () => {
    const allSelected = sortedColumns.every(col => col.selected);
    setColumnRows(rows => 
      rows.map(row => {
        // Only toggle rows that are currently visible in the filter
        if (filteredColumns.some(col => col.id === row.id)) {
          return { ...row, selected: !allSelected };
        }
        return row;
      })
    );
  };

  const selectedCount = columnRows.filter(col => col.selected).length;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div>
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
      
      <div className="rounded-md border">
        <Table>
          <TableCaption>Board Structure - Total {boardData.columns.length} Columns</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <div
                  className="cursor-pointer flex justify-center"
                  onClick={toggleAllSelection}
                >
                  {filteredColumns.length > 0 && filteredColumns.every(col => col.selected) ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("id")}>
                Column ID {getSortIndicator("id")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("title")}>
                Column Name {getSortIndicator("title")}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("type")}>
                Column Type {getSortIndicator("type")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedColumns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No columns found.
                </TableCell>
              </TableRow>
            ) : (
              sortedColumns.map((column) => (
                <TableRow key={column.id} className={column.selected ? 'bg-blue-50' : ''}>
                  <TableCell className="text-center">
                    <div 
                      className="cursor-pointer inline-flex"
                      onClick={() => toggleRowSelection(column.id)}
                    >
                      {column.selected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{column.id}</TableCell>
                  <TableCell>{column.title}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                      {column.type}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BoardStructure;
