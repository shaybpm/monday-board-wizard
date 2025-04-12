
import { toast } from "sonner";
import { fetchFromMonday } from "../api/mondayApiClient";

/**
 * Update a column value in Monday.com
 * @param itemId The ID of the item to update
 * @param boardId The ID of the board containing the item
 * @param columnId The ID of the column to update
 * @param value The new value for the column
 * @param apiToken The Monday.com API token
 * @returns A promise that resolves to true if the update was successful
 */
export const updateColumnValue = async (
  itemId: string, 
  boardId: string,
  columnId: string, 
  value: string, 
  apiToken: string
): Promise<boolean> => {
  try {
    // Show updating toast
    toast.loading(`Updating column value for item ${itemId}...`, { id: `update-${itemId}` });
    
    // Prepare the mutation query with board_id parameter
    const mutation = `
      mutation {
        change_column_value(
          item_id: ${itemId},
          board_id: ${boardId},
          column_id: "${columnId}",
          value: "${value}"
        ) {
          id
        }
      }
    `;
    
    console.log(`Updating item ${itemId}, board ${boardId}, column ${columnId} with value: ${value}`);
    
    // Call the Monday API
    const response = await fetchFromMonday(mutation, apiToken);
    
    if (response?.data?.change_column_value?.id) {
      toast.success(`Updated item ${itemId}`, { 
        id: `update-${itemId}`,
        description: `Column ${columnId} set to ${value}`
      });
      return true;
    } else {
      console.error("Failed to update column value:", response);
      toast.error(`Failed to update item ${itemId}`, { 
        id: `update-${itemId}`,
        description: `Check console for details`
      });
      return false;
    }
  } catch (error) {
    console.error("Error updating column value:", error);
    toast.error(`Error updating item ${itemId}`, { 
      id: `update-${itemId}`,
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};
