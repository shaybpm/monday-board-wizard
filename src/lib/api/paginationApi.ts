
import { toast } from "sonner";

/**
 * Fetches all items from Monday.com board with pagination
 */
export const fetchAllItemsWithPagination = async (credentials: any) => {
  let allItems: any[] = [];
  let hasMoreItems = true;
  let cursor = "";
  let page = 1;
  
  // Monday API uses cursor-based pagination
  while (hasMoreItems) {
    toast.info(`Fetching items page ${page}...`);
    
    // Use cursor-based pagination
    const cursorParam = cursor ? `, cursor: "${cursor}"` : "";
    const query = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
          items_page(limit: 100${cursorParam}) {
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
              subitems {
                id
              }
            }
            cursor
          }
        }
      }
    `;
    
    try {
      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${credentials.apiToken}`
        },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        toast.error(`API error: ${data.errors[0].message}`);
        hasMoreItems = false;
        continue;
      }
      
      const itemsPage = data?.data?.boards?.[0]?.items_page;
      const items = itemsPage?.items || [];
      cursor = itemsPage?.cursor;
      
      console.log(`Fetched ${items.length} items on page ${page}`, items);
      
      if (items.length === 0) {
        hasMoreItems = false;
      } else {
        allItems = [...allItems, ...items];
        page++;
        
        // Update the UI with current progress
        toast.info(`Fetched ${allItems.length} items so far...`);
        
        // If no cursor is returned, we've reached the end
        if (!cursor) {
          hasMoreItems = false;
          console.log("No more cursor returned, fetched all items");
        }
      }
    } catch (error) {
      console.error("Error fetching page:", error);
      toast.error(`Error fetching page ${page}`);
      hasMoreItems = false;
    }
  }
  
  console.log(`Completed fetching all ${allItems.length} items`);
  toast.success(`Successfully fetched all ${allItems.length} items!`);
  return allItems;
};

/**
 * Fetches all subitems for the provided parent items
 */
export const fetchAllSubitemsWithPagination = async (credentials: any, itemsWithSubitems: string[]) => {
  if (!itemsWithSubitems.length) return [];
  
  let allSubitems: any[] = [];
  
  // Due to API limitations, we need to fetch subitems in batches
  const batchSize = 20; // Reduce batch size for more stable requests
  const batches = [];
  
  for (let i = 0; i < itemsWithSubitems.length; i += batchSize) {
    batches.push(itemsWithSubitems.slice(i, i + batchSize));
  }
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    toast.info(`Fetching subitems batch ${i + 1}/${batches.length}...`);
    
    const query = `
      query {
        items(ids: [${batch.join(',')}]) {
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
    
    try {
      const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${credentials.apiToken}`
        },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      
      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        toast.error(`API error: ${data.errors[0].message}`);
        continue;
      }
      
      const items = data?.data?.items || [];
      
      const subitems = items.flatMap((item: any) => item.subitems || []);
      allSubitems = [...allSubitems, ...subitems];
      
      console.log(`Fetched ${subitems.length} subitems in batch ${i + 1}`);
      toast.info(`Fetched ${allSubitems.length} subitems so far...`);
    } catch (error) {
      console.error("Error fetching subitems batch:", error);
      toast.error(`Error fetching subitems batch ${i + 1}`);
    }
    
    // Add a small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`Completed fetching all ${allSubitems.length} subitems`);
  toast.success(`Successfully fetched all ${allSubitems.length} subitems!`);
  return allSubitems;
};
