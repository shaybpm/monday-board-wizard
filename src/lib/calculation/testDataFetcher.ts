
import { toast } from "sonner";
import { fetchFromMonday } from "../api/mondayApiClient";

/**
 * Fetches test data from Monday.com for calculation testing
 */
export const fetchTestData = async (boardId: string, apiToken: string) => {
  try {
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
    
    const response = await fetchFromMonday(query, apiToken);
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
    const availableColumns = firstItem.column_values.map((col: any) => 
      `${col.id}: ${col.text || 'No value'} (${col.type})`
    ).join("\n");
    console.log("Available columns:\n", availableColumns);
    
    return firstItem;
  } catch (error) {
    console.error("Error fetching test data:", error);
    throw error; // Re-throw to be handled by the caller
  }
};
