
import { CalculationToken } from "@/types/calculation";
import { toast } from "sonner";
import { fetchTestData } from "./testDataFetcher";
import { handleGenericFormula } from "./genericFormula";
import { handleSpecificHebrewCalculation } from "./hebrewCalculation";

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
    
    // Fetch the first item from the board to use for testing
    const firstItem = await fetchTestData(boardId, credentials.apiToken);
    if (!firstItem) {
      return null; // Error already handled by fetchTestData
    }
    
    // Process the formula using the appropriate handler
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
