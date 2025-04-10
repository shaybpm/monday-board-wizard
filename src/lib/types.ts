
export interface MondayCredentials {
  apiToken: string;
  sourceBoard: string;
  destinationBoard: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  type: string;
  exampleValue?: string;
  itemId?: string;  // Added new field for item ID
  itemName?: string;  // Added new field for item name
}

export interface BoardGroup {
  id: string;
  title: string;
}

export interface BoardItem {
  id: string;
  name: string;
  groupId: string;
  groupTitle: string;
  type: 'item' | 'subitem';
  parentId?: string;
  columns: Record<string, {
    id: string;
    title: string;
    type: string;
    value: any;
    text?: string;
  }>;
}

export interface TableRow {
  id: string;
  type: 'item' | 'subitem';
  groupName: string;
  columnName: string;
  columnId: string;
  columnType: string;
  exampleValue?: string;
  selected: boolean;
}

export interface ParsedBoardData {
  boardName: string;
  columns: BoardColumn[];
  groups: BoardGroup[];
  items: BoardItem[];
  subitems: BoardItem[];
}

export type DebugDataType = 'items' | 'subitems';
