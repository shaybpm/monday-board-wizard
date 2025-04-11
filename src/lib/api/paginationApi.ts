
import { fetchFromMonday } from "./mondayApiClient";
import { toast } from "sonner";

export const fetchAllItemsWithPagination = async (credentials: any) => {
  const itemsArray: any[] = [];
  let hasNextPage = true;
  let cursor = null;

  try {
    while (hasNextPage) {
      const itemsQuery = `
        query {
          boards(ids: ${credentials.sourceBoard}) {
            items_page(limit: 100${cursor ? `, cursor: "${cursor}"` : ''}) {
              cursor
              items {
                id
                name
                group {
                  id
                  title
                }
                column_values {
                  id
                  title
                  type
                  value
                  text
                  ... on FormulaValue {
                    display_value
                  }
                }
                subitems {
                  id
                }
              }
            }
          }
        }
      `;

      const response = await fetchFromMonday(itemsQuery, credentials.apiToken, "2025-01");
      const itemsPage = response.data.boards[0].items_page;
      const newItems = itemsPage.items;
      
      if (!newItems || newItems.length === 0) {
        hasNextPage = false;
      } else {
        itemsArray.push(...newItems);
        
        // Update the cursor and check if we're done
        cursor = itemsPage.cursor;
        if (!cursor) {
          hasNextPage = false;
        }
        
        toast.info(`Fetched ${itemsArray.length} items so far...`);
      }
    }
    
    toast.success(`Successfully fetched all ${itemsArray.length} items.`);
    return itemsArray;
  } catch (error) {
    console.error('Error fetching items:', error);
    toast.error('Failed to fetch all items with pagination.');
    return [];
  }
};

export const fetchAllSubitemsWithPagination = async (credentials: any, itemIds: string[]) => {
  const subitems: any[] = [];
  const batchSize = 50; // Process 50 items at a time
  
  try {
    // Process item IDs in batches
    for (let i = 0; i < itemIds.length; i += batchSize) {
      const batchIds = itemIds.slice(i, i + batchSize);
      
      const query = `
        query {
          items(ids: [${batchIds.join(',')}]) {
            id
            subitems {
              id
              name
              parent_item {
                id
              }
              column_values {
                id
                title
                type
                value
                text
                ... on FormulaValue {
                  display_value
                }
              }
            }
          }
        }
      `;
      
      const response = await fetchFromMonday(query, credentials.apiToken, "2025-01");
      
      if (response.data && response.data.items) {
        response.data.items.forEach((item: any) => {
          if (item.subitems && item.subitems.length > 0) {
            subitems.push(...item.subitems);
          }
        });
      }
      
      toast.info(`Fetched subitems for ${i + batchIds.length} of ${itemIds.length} items...`);
    }
    
    toast.success(`Successfully fetched all ${subitems.length} subitems.`);
    return subitems;
  } catch (error) {
    console.error('Error fetching subitems:', error);
    toast.error('Failed to fetch all subitems with pagination.');
    return [];
  }
};
