
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

  const fetchAllItemsWithPagination = async (credentials: any, pageSize = 100) => {
    let allItems: any[] = [];
    let currentPage = 1;
    let hasMoreItems = true;
    
    while (hasMoreItems) {
      toast.info(`Fetching items page ${currentPage}...`);
      
      const query = `
        query {
          boards(ids: ${credentials.sourceBoard}) {
            items_page(limit: ${pageSize}, page: ${currentPage}) {
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
        const items = data?.data?.boards?.[0]?.items_page?.items || [];
        
        if (items.length === 0) {
          hasMoreItems = false;
        } else {
          allItems = [...allItems, ...items];
          currentPage++;
        }
      } catch (error) {
        console.error("Error fetching page:", error);
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
        const items = data?.data?.items || [];
        
        const subitems = items.flatMap((item: any) => item.subitems || []);
        allSubitems = [...allSubitems, ...subitems];
      } catch (error) {
        console.error("Error fetching subitems batch:", error);
      }
    }
    
    return allSubitems;
  };

  const fetchAllBoardData = async () => {
    setIsFetching(true);
    toast.info("Fetching all board data...");
    
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
        
        // Find items that have subitems
        const itemsWithSubitems = items
          .filter(item => item.subitems && item.subitems.length > 0)
          .map(item => item.id);
        
        // Fetch all subitems for those items
        const subitems = await fetchAllSubitemsWithPagination(credentials, itemsWithSubitems);
        
        // Log summary data
        const summary = {
          boardName: fetchedBoardData.boardName,
          totalItems: items.length,
          totalSubitems: subitems.length,
          columns: fetchedBoardData.columns.length,
          subitemColumns: fetchedBoardData.subitemColumns?.length || 0
        };
        
        console.log("Board data summary:", summary);
        
        toast.success(`Fetched ${items.length} items and ${subitems.length} subitems from the board.`);
        
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
        
        setBoardData(updatedBoardData);
        sessionStorage.setItem("mondayBoardData", JSON.stringify(updatedBoardData));
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
