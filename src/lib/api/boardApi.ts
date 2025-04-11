
import { MondayCredentials, ParsedBoardData } from "../types";
import { fetchBoardStructure } from "./boardStructureApi";
import { fetchExampleData } from "./boardExampleDataApi";
import { fetchSubitemData } from "./boardSubitemApi";

/**
 * Fetches complete board structure with example data from items and subitems
 */
export const fetchBoardStructureWithExamples = async (
  credentials: MondayCredentials
): Promise<ParsedBoardData | null> => {
  try {
    // 1. First fetch the basic board structure
    const boardStructure = await fetchBoardStructure(credentials);
    
    if (!boardStructure) {
      return null;
    }
    
    // 2. Enrich with example data from first item
    const dataWithExamples = await fetchExampleData(
      credentials.apiToken, 
      credentials.sourceBoard, 
      boardStructure
    );
    
    // 3. If the first item has subitems, fetch the first subitem data
    if (dataWithExamples.columns.some(col => col.itemId !== "N/A")) {
      const firstItemId = dataWithExamples.columns[0].itemId;
      if (firstItemId && firstItemId !== "N/A") {
        return await fetchSubitemData(
          credentials.apiToken,
          firstItemId,
          dataWithExamples
        );
      }
    }
    
    return dataWithExamples;
  } catch (error) {
    console.error("Error in fetchBoardStructureWithExamples:", error);
    return null;
  }
};

// Re-export for backward compatibility
export { fetchBoardStructure } from './boardStructureApi';
