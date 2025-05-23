
import { MondayCredentials } from "../types";
import { fetchFromMonday } from "./mondayApiClient";
import { toast } from "sonner";

export const fetchDebugItems = async (
  credentials: MondayCredentials,
  limit: number = 20
): Promise<any[]> => {
  try {
    // Fixed query - removed 'title' field from column_values which was causing the error
    const query = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
          items_page(limit: ${limit}) {
            items {
              id
              name
              group {
                id
                title
              }
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
    
    console.log("Sending debug items query to Monday API:", query);
    const response = await fetchFromMonday(query, credentials.apiToken);
    
    if (!response?.data?.boards?.[0]?.items_page?.items) {
      toast.error("Failed to fetch debug items");
      return [];
    }
    
    return response.data.boards[0].items_page.items;
  } catch (error) {
    console.error("Error fetching debug items:", error);
    toast.error("Error fetching debug items: " + (error instanceof Error ? error.message : String(error)));
    return [];
  }
};

export const fetchDebugSubitems = async (
  credentials: MondayCredentials,
  limit: number = 20
): Promise<any[]> => {
  try {
    // First get items that have subitems
    const itemsQuery = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
          items_page(limit: 5) {
            items {
              id
              name
              subitems {
                id
              }
            }
          }
        }
      }
    `;
    
    console.log("Fetching items to find subitems...");
    const itemsResponse = await fetchFromMonday(itemsQuery, credentials.apiToken);
    
    if (!itemsResponse?.data?.boards?.[0]?.items_page?.items) {
      toast.error("Failed to fetch items for subitems");
      return [];
    }
    
    // Get item IDs that have subitems
    const itemsWithSubitems = itemsResponse.data.boards[0].items_page.items
      .filter((item: any) => item.subitems && item.subitems.length > 0)
      .map((item: any) => item.id);
    
    if (itemsWithSubitems.length === 0) {
      console.log("No items with subitems found");
      toast.info("No subitems found in the first items");
      return [];
    }
    
    // Fixed query - Use proper syntax for querying subitems
    // The previous approach was using 'items_ids' which doesn't exist
    // Instead, we'll use the 'ids' parameter to specify items and then get subitems
    const subitemsQuery = `
      query {
        items(ids: [${itemsWithSubitems.join(',')}]) {
          id
          name
          subitems {
            id
            name
            column_values {
              id
              text
              value
              type
            }
            parent_item {
              id
              name
            }
          }
        }
      }
    `;
    
    console.log("Fetching subitems data...");
    const subitemsResponse = await fetchFromMonday(subitemsQuery, credentials.apiToken);
    
    if (!subitemsResponse?.data?.items) {
      toast.error("Failed to fetch subitems data");
      return [];
    }
    
    // Flatten subitems from all items
    const subitems = subitemsResponse.data.items
      .flatMap((item: any) => item.subitems || [])
      .slice(0, limit);
    
    console.log(`Found ${subitems.length} subitems`);
    
    // Transform subitems to match the expected format for board display
    subitems.forEach((subitem: any) => {
      if (subitem.column_values && Array.isArray(subitem.column_values)) {
        subitem.columns = {};
        subitem.column_values.forEach((col: any) => {
          subitem.columns[col.id] = {
            id: col.id,
            type: col.type,
            value: col.value,
            text: col.text
          };
        });
      }
    });
    
    return subitems;
  } catch (error) {
    console.error("Error fetching debug subitems:", error);
    toast.error("Error fetching debug subitems: " + (error instanceof Error ? error.message : String(error)));
    return [];
  }
};
