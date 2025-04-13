
import { toast } from "sonner";

/**
 * Handles the specific calculation for Hebrew columns
 */
export const handleSpecificHebrewCalculation = (firstItem: any) => {
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
