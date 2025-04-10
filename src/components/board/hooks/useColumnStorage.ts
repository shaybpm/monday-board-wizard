
import { useState, useEffect } from "react";
import { ColumnWidth, ColumnRow } from "../types";

const STORAGE_KEY_COLUMN_WIDTH = "monday-column-widths";
const STORAGE_KEY_COLUMN_ORDER = "monday-column-order";

export const useColumnStorage = (columns: ColumnRow[]) => {
  const calculateDefaultWidths = () => {
    const widths: ColumnWidth = {
      id: 60,
      title: 100,
      type: 60,
      firstLine: 120
    };
    
    columns.forEach(column => {
      widths.id = Math.max(widths.id, Math.min(100, column.id.length * 5 + 10));
      widths.title = Math.max(widths.title, Math.min(150, column.title.length * 5 + 20));
      widths.type = Math.max(widths.type, Math.min(100, column.type.length * 5 + 10));
      
      if (column.firstLineValue) {
        const valueLength = column.firstLineValue.length;
        widths.firstLine = Math.max(widths.firstLine, Math.min(200, valueLength * 5 + 20));
      }
    });
    
    return widths;
  };

  const [columnWidths, setColumnWidths] = useState<ColumnWidth>(calculateDefaultWidths());
  const defaultColumnOrder = ["title", "id", "type", "firstLine"];
  const [columnOrder, setColumnOrder] = useState<string[]>(defaultColumnOrder);

  // Load column widths and order from localStorage
  useEffect(() => {
    try {
      const savedWidths = localStorage.getItem(STORAGE_KEY_COLUMN_WIDTH);
      if (savedWidths) {
        const parsedWidths = JSON.parse(savedWidths);
        if (!parsedWidths.firstLine) {
          parsedWidths.firstLine = 120;
        }
        if (parsedWidths.itemId) {
          delete parsedWidths.itemId;
        }
        setColumnWidths(parsedWidths);
      } else {
        setColumnWidths(calculateDefaultWidths());
      }
      
      const savedOrder = localStorage.getItem(STORAGE_KEY_COLUMN_ORDER);
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        const filteredOrder = parsedOrder.filter((col: string) => col !== "itemId");
        
        if (!filteredOrder.includes("firstLine")) {
          filteredOrder.push("firstLine");
        }
        
        if (filteredOrder.includes("title") && filteredOrder.includes("id")) {
          const titleIndex = filteredOrder.indexOf("title");
          const idIndex = filteredOrder.indexOf("id");
          
          if (idIndex < titleIndex) {
            filteredOrder.splice(idIndex, 1);
            filteredOrder.splice(titleIndex - 1, 0, "id");
          }
        }
        
        setColumnOrder(filteredOrder);
      } else {
        setColumnOrder(defaultColumnOrder);
      }
    } catch (error) {
      console.error("Error loading saved column settings:", error);
      setColumnWidths(calculateDefaultWidths());
      setColumnOrder(defaultColumnOrder);
    }
  }, []);

  // Save column widths and order to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLUMN_WIDTH, JSON.stringify(columnWidths));
      localStorage.setItem(STORAGE_KEY_COLUMN_ORDER, JSON.stringify(columnOrder));
    } catch (error) {
      console.error("Error saving column settings:", error);
    }
  }, [columnWidths, columnOrder]);

  return {
    columnWidths,
    setColumnWidths,
    columnOrder,
    setColumnOrder,
    calculateDefaultWidths
  };
};
