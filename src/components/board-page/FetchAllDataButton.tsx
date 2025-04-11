
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { fetchBoardStructure } from "@/lib/mondayAPI";
import { ParsedBoardData } from "@/lib/types";

interface FetchAllDataButtonProps {
  setBoardData: React.Dispatch<React.SetStateAction<ParsedBoardData | null>>;
}

const FetchAllDataButton = ({ setBoardData }: FetchAllDataButtonProps) => {
  const [isFetching, setIsFetching] = useState(false);

  const fetchAllItemsWithPagination = async (credentials: any) => {
    let allItems: any[] = [];
    let hasMoreItems = true;
    let cursor = "";
    let page = 1;
    
    // Monday API does not use page parameter but cursor for pagination
    while (hasMoreItems) {
      toast.info(`Fetching items page ${page}...`);
      
      // Use cursor-based pagination instead of page-based
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
        
        if (items.length === 0 || !cursor) {
          hasMoreItems = false;
        } else {
          allItems = [...allItems, ...items];
          page++;
          
          // Update the UI with current progress
          toast.info(`Fetched ${allItems.length} items so far...`);
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        toast.error(`Error fetching page ${page}`);
        hasMoreItems = false;
      }
    }
    
    return allItems;
  };
  
  const fetchAllSubitemsWithPagination = async (credentials: any, itemsWithSubitems: string[]) => {
    if (!itemsWithSubitems.length) return [];
    
    let allSubitems: any[] = [];
    
    // Due to API limitations, we need to fetch subitems in batches
    const batchSize = 20;
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
    }
    
    return allSubitems;
  };

  const fetchAllBoardData = async () => {
    setIsFetching(true);
    toast.info("Starting to fetch all board data...");
    
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      toast.error("No credentials found. Please connect to Monday.com first.");
      setIsFetching(false);
      return;
    }
    
    try {
      const credentials = JSON.parse(storedCredentialsStr);
      
      // First fetch board structure
      const fetchedBoardData = await fetchBoardStructure(credentials);
      
      if (fetchedBoardData) {
        // Then fetch all items with pagination
        const items = await fetchAllItemsWithPagination(credentials);
        
        if (items.length === 0) {
          toast.warning("No items found in the board.");
        } else {
          toast.success(`Successfully fetched ${items.length} items.`);
        }
        
        // Find items that have subitems
        const itemsWithSubitems = items
          .filter(item => item.subitems && item.subitems.length > 0)
          .map(item => item.id);
        
        console.log(`Found ${itemsWithSubitems.length} items with subitems`);
        
        let subitems: any[] = [];
        
        // Fetch all subitems for those items
        if (itemsWithSubitems.length > 0) {
          subitems = await fetchAllSubitemsWithPagination(credentials, itemsWithSubitems);
          
          if (subitems.length === 0) {
            toast.warning("No subitems found despite items having subitem references.");
          } else {
            toast.success(`Successfully fetched ${subitems.length} subitems.`);
          }
        } else {
          console.log("No items with subitems found");
        }
        
        // Log summary data
        const summary = {
          boardName: fetchedBoardData.boardName,
          totalItems: items.length,
          totalSubitems: subitems.length,
          columns: fetchedBoardData.columns.length,
          subitemColumns: fetchedBoardData.subitemColumns?.length || 0
        };
        
        console.log("Board data summary:", summary);
        
        // Transform items into the expected format
        const transformedItems = items.map((item: any) => {
          const transformedItem = {
            id: item.id,
            name: item.name,
            type: "item" as const,
            groupId: item.group?.id || '',
            groupTitle: item.group?.title || '',
            columns: {} as Record<string, any>
          };
          
          // Transform column values into the expected format
          item.column_values.forEach((cv: any) => {
            transformedItem.columns[cv.id] = {
              id: cv.id,
              type: cv.type || '',
              value: cv.value || '',
              text: cv.text || ''
            };
          });
          
          return transformedItem;
        });
        
        // Transform subitems into the expected format
        const transformedSubitems = subitems.map((subitem: any) => {
          const transformedSubitem = {
            id: subitem.id,
            name: subitem.name,
            type: "subitem" as const,
            parentId: subitem.parent_item?.id || '',
            groupId: '',
            groupTitle: '',
            columns: {} as Record<string, any>
          };
          
          // Transform column values into the expected format
          subitem.column_values.forEach((cv: any) => {
            transformedSubitem.columns[cv.id] = {
              id: cv.id,
              type: cv.type || '',
              value: cv.value || '',
              text: cv.text || ''
            };
          });
          
          return transformedSubitem;
        });
        
        // Update board data
        const updatedBoardData = {
          ...fetchedBoardData,
          items: transformedItems,
          subitems: transformedSubitems
        };
        
        console.log("Setting updated board data:", {
          itemCount: transformedItems.length,
          subitemCount: transformedSubitems.length
        });
        
        setBoardData(updatedBoardData);
        sessionStorage.setItem("mondayBoardData", JSON.stringify(updatedBoardData));
        toast.success(`Successfully updated board data with ${transformedItems.length} items and ${transformedSubitems.length} subitems.`);
      } else {
        toast.error("Failed to fetch board data.");
      }
    } catch (error) {
      console.error("Error fetching all board data:", error);
      toast.error("Error fetching all board data. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Button
      onClick={fetchAllBoardData}
      disabled={isFetching}
      variant="default"
      className="flex items-center gap-2"
    >
      {isFetching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isFetching ? "Fetching..." : "Fetch All Board Data"}
    </Button>
  );
};

export default FetchAllDataButton;
