
export interface ColumnRow {
  id: string;
  title: string;
  type: string;
  firstLineValue?: string;
  itemId?: string;
  itemName?: string;
  selected: boolean;
}

export interface ColumnWidth {
  [key: string]: number;
}
