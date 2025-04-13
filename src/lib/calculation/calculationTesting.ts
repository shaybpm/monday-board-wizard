
import { CalculationToken } from "@/types/calculation";
import { BoardItem } from "@/lib/types";
import { toast } from "sonner";
import { fetchFromMonday } from "../api/mondayApiClient";
import { evaluateFormulaForItem } from "./formulaEvaluation";

/**
 * Tests the calculation with real data from the first item in the board
 */
export const testCalculationFormula = async (formula: CalculationToken[]) => {
  try {
    // Get credentials from session storage
    const credsStr = sessionStorage.getItem("mondayCredentials");
    if (!credsStr) {
      toast.error("No Monday.com credentials found", { id: "test-calculation" });
      return null;
    }
    
    const credentials = JSON.parse(credsStr);
    const boardId = credentials.sourceBoard || "1909452712"; // Use specified board ID or fallback
    
    // If formula is empty or if we're doing the specific Hebrew column calculation
    const doSpecificCalculation = !formula || formula.length === 0;
    
    // Fetch the first item from the specified board
    const query = `
      query {
        boards(ids: ${boardId}) {
          items_page(limit: 1) {
            items {
              id
              name
              column_values {
                id
                text
                value
                type
              }
            }
          }
        }
      }
    `;
    
    console.log("Fetching data from Monday.com for test calculation...");
    console.log("Query:", query);
    
    const response = await fetchFromMonday(query, credentials.apiToken);
    console.log("Monday API response:", response);
    
    if (!response?.data?.boards?.[0]?.items_page?.items?.[0]) {
      toast.error("No items found in the board", { 
        id: "test-calculation",
        description: "Board ID: " + boardId
      });
      return null;
    }
    
    const firstItem = response.data.boards[0].items_page.items[0];
    console.log("First item data:", firstItem);
    
    // Log all column values to help debug
    const availableColumns = firstItem.column_values.map(col => 
      `${col.id}: ${col.text || 'No value'} (${col.type})`
    ).join("\n");
    console.log("Available columns:\n", availableColumns);
    
    if (doSpecificCalculation) {
      return handleSpecificHebrewCalculation(firstItem);
    } else {
      return handleGenericFormula(formula, firstItem);
    }
  } catch (error) {
    console.error("Test calculation error:", error);
    toast.error("Test failed", {
      id: "test-calculation",
      description: error instanceof Error ? error.message : "An error occurred while testing the calculation."
    });
    return null;
  }
};

/**
 * Handles the specific calculation for Hebrew columns
 */
const handleSpecificHebrewCalculation = (firstItem: any) => {
  // Find the specified columns (סכום בחשבון, סכום בתקבול)
  const accountColumn = firstItem.column_values.find(
    (col: any) => col.id === "numeric_mkpv862j"
  );
  
  const receiptColumn = firstItem.column_values.find(
    (col: any) => col.id === "numeric_mkpv3cnz"
  );
  
  if (!accountColumn || !receiptColumn) {
    const missingColumns = [];
    if (!accountColumn) missingColumns.push("סכום בחשבון (numeric_mkpv862j)");
    if (!receiptColumn) missingColumns.push("סכום בתקבול (numeric_mkpv3cnz)");
    
    toast.error(`Could not find required columns`, {
      id: "test-calculation",
      description: `Missing: ${missingColumns.join(", ")}\nAvailable columns: ${firstItem.column_values.slice(0, 3).map((c: any) => c.id).join(", ")}...`
    });
    
    return null;
  }
  
  // Parse the values and calculate difference
  const accountValue = parseFloat(accountColumn.text || "0");
  const receiptValue = parseFloat(receiptColumn.text || "0");
  
  if (isNaN(accountValue) || isNaN(receiptValue)) {
    toast.error("Column values are not valid numbers", {
      id: "test-calculation",
      description: `Account: ${accountColumn.text}, Receipt: ${receiptColumn.text}`
    });
    return null;
  }
  
  const difference = accountValue - receiptValue;
  
  // Create calculation display
  let calculation = `Calculation for item "${firstItem.name}":\n`;
  calculation += `סכום בחשבון (${accountColumn.id}): ${accountValue}\n`;
  calculation += `סכום בתקבול (${receiptColumn.id}): ${receiptValue}\n`;
  calculation += `\nDifference = ${difference}`;
  
  toast.success("Calculation successful!", {
    id: "test-calculation",
    description: calculation,
    duration: 8000
  });
  
  return difference.toString();
};

/**
 * Handles evaluation of user-defined formula
 */
const handleGenericFormula = (formula: CalculationToken[], firstItem: any) => {
  // Convert the first item to our internal format
  const formattedItem: BoardItem = {
    id: firstItem.id,
    name: firstItem.name,
    groupId: "",
    groupTitle: "",
    type: 'item',
    columns: {}
  };
  
  // Add all columns to our formatted item
  firstItem.column_values.forEach((col: any) => {
    formattedItem.columns[col.id] = {
      id: col.id,
      title: col.id, // Using column ID as title since title is not available
      type: col.type,
      value: col.value,
      text: col.text
    };
  });
  
  // Check if the first item has all required columns, but ONLY check for actual columns
  const missingColumns: string[] = [];
  formula.forEach(token => {
    // Only validate column tokens, not number or other tokens
    if (token.type === "column") {
      if (!formattedItem.columns[token.id] || !formattedItem.columns[token.id].text) {
        missingColumns.push(token.display);
      }
    }
  });
  
  if (missingColumns.length > 0) {
    toast.error("First item is missing required columns", {
      id: "test-calculation",
      description: `Missing columns: ${missingColumns.join(", ")}`
    });
    return null;
  }
  
  // Evaluate the formula for the first item
  const result = evaluateFormulaForItem(formula, formattedItem);
  
  // Build the calculation display string with actual values
  let calculation = `Test calculation using first item "${formattedItem.name}":\n`;
  
  // Include actual column values and number literals in the display
  formula.forEach(token => {
    if (token.type === "column") {
      const columnValue = formattedItem.columns[token.id];
      const displayValue = columnValue?.text || "N/A";
      calculation += `${token.display} (${token.id}) = ${displayValue}\n`;
    } else if (token.type === "number") {
      calculation += `Number: ${token.display} = ${token.value}\n`;
    } else if (token.type === "condition") {
      calculation += `Condition: ${token.display}\n`;
    } else if (token.type === "logical") {
      calculation += `Logic: ${token.display}\n`;
    }
  });
  
  calculation += `\nResult = ${result}`;
  
  if (typeof result === "string" && result.startsWith("Error")) {
    toast.error("Calculation error", {
      id: "test-calculation",
      description: result,
      duration: 5000
    });
    return null;
  } else {
    toast.success("Test successful!", {
      id: "test-calculation",
      description: calculation,
      duration: 8000
    });
    
    return result.toString();
  }
};
