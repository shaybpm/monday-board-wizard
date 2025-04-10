import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardItem, ParsedBoardData, TableRow } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowDown, ArrowUp, Search, Filter, X, 
  CheckSquare, Square, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BoardStructureProps {
  boardData: ParsedBoardData;
}

const BoardStructure: React.FC<BoardStructureProps> = ({ boardData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<TableRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<TableRow[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending" | null;
  }>({ key: "", direction: null });
  const [filters, setFilters] = useState({
    type: "all", // "all", "item", "subitem"
    group: "all",
    columnType: "all"
  });
  const [selectedCount, setSelectedCount] = useState(0);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const navigate = useNavigate();
  
  // Generate unique column types for filtering
  const uniqueColumnTypes = Array.from(
    new Set(boardData.columns.map((col) => col.type))
  );
  
  // Generate unique group names for filtering
  const uniqueGroups = boardData.groups.map((group) => ({
    id: group.id,
    title: group.title
  }));

  // Transform board data into table rows
  useEffect(() => {
    if (!boardData) return;

    const transformedRows: TableRow[] = [];
    
    // First row of data for items
    boardData.items.forEach(item => {
      boardData.columns.forEach(column => {
        const columnData = item.columns[column.id];
        
        transformedRows.push({
          id: `${item.id}-${column.id}`,
          type: 'item',
          groupName: item.groupTitle,
          columnName: column.title,
          columnId: column.id,
          columnType: column.type,
          exampleValue: columnData?.value ? JSON.stringify(columnData.value).substring(0, 50) : '',
          selected: false
        });
      });
    });

    // First row of data for subitems
    boardData.subitems.forEach(subitem => {
      boardData.columns.forEach(column => {
        const columnData = subitem.columns[column.id];
        
        transformedRows.push({
          id: `${subitem.id}-${column.id}`,
          type: 'subitem',
          groupName: subitem.groupTitle,
          columnName: column.title,
          columnId: column.id,
          columnType: column.type,
          exampleValue: columnData?.value ? JSON.stringify(columnData.value).substring(0, 50) : '',
          selected: false
        });
      });
    });

    setRows(transformedRows);
    setFilteredRows(transformedRows);
  }, [boardData]);

  // Update filtered rows based on search term and filters
  useEffect(() => {
    let result = rows;

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        row =>
          row.columnName.toLowerCase().includes(lowercasedSearch) ||
          row.columnId.toLowerCase().includes(lowercasedSearch) ||
          row.groupName.toLowerCase().includes(lowercasedSearch) ||
          (row.exampleValue && row.exampleValue.toLowerCase().includes(lowercasedSearch))
      );
    }

    // Apply type filter
    if (filters.type !== "all") {
      result = result.filter(row => row.type === filters.type);
    }

    // Apply group filter
    if (filters.group !== "all") {
      result = result.filter(row => {
        const group = uniqueGroups.find(g => g.id === filters.group);
        return row.groupName === group?.title;
      });
    }

    // Apply column type filter
    if (filters.columnType !== "all") {
      result = result.filter(row => row.columnType === filters.columnType);
    }

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key as keyof TableRow] < b[sortConfig.key as keyof TableRow]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key as keyof TableRow] > b[sortConfig.key as keyof TableRow]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredRows(result);
  }, [searchTerm, filters, rows, sortConfig, uniqueGroups]);

  // Update selected count
  useEffect(() => {
    setSelectedCount(filteredRows.filter(row => row.selected).length);
  }, [filteredRows]);

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" | null = "ascending";
    
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (sortConfig.key === key && sortConfig.direction === "descending") {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: string) => {
    if (sortConfig.key !== columnName) {
      return null;
    }
    
    return sortConfig.direction === "ascending" ? 
      <ArrowUp className="inline w-4 h-4 ml-1" /> : 
      <ArrowDown className="inline w-4 h-4 ml-1" />;
  };

  const toggleRowSelection = (id: string) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    );
  };

  const toggleAllSelection = () => {
    const areAllSelected = filteredRows.every(row => row.selected);
    setRows(prevRows =>
      prevRows.map(row => {
        // Only toggle selection for rows that are currently filtered/visible
        if (filteredRows.some(filteredRow => filteredRow.id === row.id)) {
          return { ...row, selected: !areAllSelected };
        }
        return row;
      })
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      type: "all",
      group: "all",
      columnType: "all"
    });
    setSortConfig({ key: "", direction: null });
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const startResizing = (columnId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResizingColumn(columnId);
    
    const startX = e.clientX;
    const startWidth = columnWidths[columnId] || 150; // Default width if not set
    
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const newWidth = Math.max(50, startWidth + (e.clientX - startX));
        setColumnWidths(prev => ({
          ...prev,
          [columnId]: newWidth
        }));
      }
    };
    
    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const exportSelection = () => {
    const selectedRows = rows.filter(row => row.selected);
    if (selectedRows.length === 0) {
      toast.error("No columns selected for export");
      return;
    }

    const data = selectedRows.map(row => ({
      type: row.type,
      groupName: row.groupName,
      columnName: row.columnName,
      columnId: row.columnId,
      columnType: row.columnType
    }));

    // Convert to JSON and create download
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.download = `monday-columns-${new Date().toISOString().split('T')[0]}.json`;
    a.href = url;
    a.click();
    
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedRows.length} columns`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">{boardData.boardName}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportSelection}
            disabled={selectedCount === 0}
          >
            Export Selected ({selectedCount})
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search columns, IDs, values..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2.5"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              {isFilterMenuOpen && (
                <Card className="absolute right-0 top-full z-10 mt-1 w-[300px]">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Item Type</label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters({...filters, type: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2 mt-1"
                        >
                          <option value="all">All Types</option>
                          <option value="item">Items Only</option>
                          <option value="subitem">Subitems Only</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Group</label>
                        <select
                          value={filters.group}
                          onChange={(e) => setFilters({...filters, group: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2 mt-1"
                        >
                          <option value="all">All Groups</option>
                          {uniqueGroups.map(group => (
                            <option key={group.id} value={group.id}>
                              {group.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Column Type</label>
                        <select
                          value={filters.columnType}
                          onChange={(e) => setFilters({...filters, columnType: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2 mt-1"
                        >
                          <option value="all">All Types</option>
                          {uniqueColumnTypes.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <Button onClick={resetFilters} variant="ghost" className="mr-2">
                          Reset
                        </Button>
                        <Button onClick={() => setIsFilterMenuOpen(false)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Active filters display */}
          {(filters.type !== "all" || filters.group !== "all" || filters.columnType !== "all") && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {filters.type !== "all" && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Type: {filters.type}
                  <button onClick={() => setFilters({...filters, type: "all"})}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {filters.group !== "all" && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Group: {uniqueGroups.find(g => g.id === filters.group)?.title}
                  <button onClick={() => setFilters({...filters, group: "all"})}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {filters.columnType !== "all" && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Column Type: {filters.columnType}
                  <button onClick={() => setFilters({...filters, columnType: "all"})}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <div className="table-container flex-1 overflow-auto border rounded-md">
        <table ref={tableRef} className="w-full border-collapse min-w-full">
          <thead>
            <tr>
              <th className="table-header-cell w-10 border-r">
                <div
                  className="cursor-pointer flex justify-center items-center"
                  onClick={toggleAllSelection}
                >
                  {filteredRows.length > 0 && filteredRows.every(row => row.selected) ? (
                    <CheckSquare className="h-5 w-5 text-monday-blue" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </div>
              </th>
              <th 
                className="table-header-cell border-r resizable-th"
                style={{ minWidth: columnWidths["type"] || 120, width: columnWidths["type"] || 120 }}
                onClick={() => requestSort("type")}
              >
                Type {getSortIcon("type")}
                <div 
                  className="resizer" 
                  onMouseDown={(e) => startResizing("type", e)}
                ></div>
              </th>
              <th 
                className="table-header-cell border-r resizable-th"
                style={{ minWidth: columnWidths["groupName"] || 150, width: columnWidths["groupName"] || 150 }}
                onClick={() => requestSort("groupName")}
              >
                Group Name {getSortIcon("groupName")}
                <div 
                  className="resizer" 
                  onMouseDown={(e) => startResizing("groupName", e)}
                ></div>
              </th>
              <th 
                className="table-header-cell border-r resizable-th"
                style={{ minWidth: columnWidths["columnName"] || 200, width: columnWidths["columnName"] || 200 }}
                onClick={() => requestSort("columnName")}
              >
                Column Name {getSortIcon("columnName")}
                <div 
                  className="resizer" 
                  onMouseDown={(e) => startResizing("columnName", e)}
                ></div>
              </th>
              <th 
                className="table-header-cell border-r resizable-th"
                style={{ minWidth: columnWidths["columnId"] || 150, width: columnWidths["columnId"] || 150 }}
                onClick={() => requestSort("columnId")}
              >
                Column ID {getSortIcon("columnId")}
                <div 
                  className="resizer" 
                  onMouseDown={(e) => startResizing("columnId", e)}
                ></div>
              </th>
              <th 
                className="table-header-cell border-r resizable-th"
                style={{ minWidth: columnWidths["columnType"] || 150, width: columnWidths["columnType"] || 150 }}
                onClick={() => requestSort("columnType")}
              >
                Column Type {getSortIcon("columnType")}
                <div 
                  className="resizer" 
                  onMouseDown={(e) => startResizing("columnType", e)}
                ></div>
              </th>
              <th 
                className="table-header-cell resizable-th"
                style={{ minWidth: columnWidths["exampleValue"] || 300, width: columnWidths["exampleValue"] || 300 }}
              >
                Example Value
                <div 
                  className="resizer" 
                  onMouseDown={(e) => startResizing("exampleValue", e)}
                ></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No matching columns found.
                </td>
              </tr>
            ) : (
              filteredRows.map(row => (
                <tr 
                  key={row.id}
                  className={
                    `hover:bg-gray-50 ${row.selected ? 'bg-monday-lightBlue' : ''} 
                     ${row.type === 'subitem' ? 'text-gray-600' : ''}
                     border-b last:border-b-0`
                  }
                >
                  <td className="p-2 border-r text-center">
                    <div 
                      className="cursor-pointer flex justify-center"
                      onClick={() => toggleRowSelection(row.id)}
                    >
                      {row.selected ? (
                        <CheckSquare className="h-5 w-5 text-monday-blue" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </div>
                  </td>
                  <td className="p-2 border-r">
                    <span className={`px-2 py-1 rounded text-xs ${
                      row.type === 'item' 
                        ? 'bg-monday-blue/10 text-monday-blue' 
                        : 'bg-monday-green/10 text-monday-green'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="p-2 border-r truncate">{row.groupName}</td>
                  <td className="p-2 border-r truncate font-medium">{row.columnName}</td>
                  <td className="p-2 border-r font-mono text-sm">{row.columnId}</td>
                  <td className="p-2 border-r">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {row.columnType}
                    </span>
                  </td>
                  <td className="p-2 truncate font-mono text-xs text-gray-600">
                    {row.exampleValue || <span className="text-gray-400 italic">No example</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer stats */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredRows.length} of {rows.length} columns • 
        {selectedCount > 0 && ` ${selectedCount} selected •`}
        Items: {rows.filter(r => r.type === 'item').length} •
        Subitems: {rows.filter(r => r.type === 'subitem').length}
      </div>
    </div>
  );
};

export default BoardStructure;
