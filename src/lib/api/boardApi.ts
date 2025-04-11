
import { MondayCredentials, ParsedBoardData } from "../types";
import { fetchFromMonday } from "./mondayApiClient";
import { toast } from "sonner";

export const fetchBoardStructure = async (
  credentials: MondayCredentials
): Promise<ParsedBoardData | null> => {
  try {
    const boardQuery = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
          id
          name
          columns {
            id
            title
            type
          }
          groups {
            id
            title
          }
        }
      }
    `;

    const boardResponse = await fetchFromMonday(boardQuery, credentials.apiToken);
    
    if (!boardResponse?.data?.boards || boardResponse.data.boards.length === 0) {
      toast.error("Error: Could not fetch board data");
      return null;
    }

    const board = boardResponse.data.boards[0];
    
    const parsedData: ParsedBoardData = {
      boardName: board.name,
      columns: board.columns || [],
      groups: board.groups || [],
      items: [],
      subitems: []
    };

    console.log("Fetched board structure:", {
      name: parsedData.boardName,
      columnsCount: parsedData.columns.length,
      groupsCount: parsedData.groups.length
    });

    try {
      // Fetch regular items data first
      const itemsQuery = `
        query {
          boards(ids: ${credentials.sourceBoard}) {
            items_page(limit: 1) {
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

      const itemsResponse = await fetchFromMonday(itemsQuery, credentials.apiToken, "2025-01");
      
      if (itemsResponse?.data?.boards?.[0]?.items_page?.items?.[0]) {
        const firstItem = itemsResponse.data.boards[0].items_page.items[0];
        console.log("First item data:", firstItem);
        
        // Add the item ID and name to the parsed data
        const itemId = firstItem.id;
        const itemName = firstItem.name;
        
        parsedData.columns = parsedData.columns.map(column => {
          const columnValue = firstItem.column_values.find(cv => cv.id === column.id);
          // Use display_value for formula type columns if available
          const exampleValue = columnValue ? 
            (column.type === 'formula' && columnValue.display_value ? 
              columnValue.display_value : 
              (columnValue.text || JSON.stringify(columnValue.value))) : 
            "N/A";
            
          return {
            ...column,
            exampleValue: exampleValue,
            itemId: itemId,
            itemName: itemName
          };
        });
        
        // Check if the first item has subitems
        if (firstItem.subitems && firstItem.subitems.length > 0) {
          try {
            // Now try to fetch subitem data
            const subitemQuery = `
              query {
                items(ids: [${itemId}]) {
                  subitems {
                    id
                    name
                    column_values {
                      id
                      text
                      value
                      type
                      ... on FormulaValue {
                        display_value
                      }
                    }
                  }
                }
              }
            `;
            
            console.log("Fetching subitem data for structure...");
            const subitemResponse = await fetchFromMonday(subitemQuery, credentials.apiToken, "2025-01");
            
            if (subitemResponse?.data?.items?.[0]?.subitems?.length > 0) {
              const firstSubitem = subitemResponse.data.items[0].subitems[0];
              console.log("First subitem data:", firstSubitem);
              
              // Store the subitem columns separately - this is the key change
              const subitemColumns = firstSubitem.column_values.map((cv: any) => {
                // Use display_value for formula type columns if available
                const exampleValue = cv.type === 'formula' && cv.display_value ? 
                  cv.display_value : 
                  (cv.text || JSON.stringify(cv.value) || "N/A");
                
                return {
                  id: cv.id,
                  title: cv.title || cv.id, // Use id as fallback if title is not available
                  type: cv.type || 'text',
                  exampleValue: exampleValue,
                  itemId: firstSubitem.id,
                  itemName: firstSubitem.name
                };
              });
              
              // Save these distinct subitem columns to the parsedData
              parsedData.subitemColumns = subitemColumns;
              
              // Fix the type error by explicitly setting type to "subitem" instead of a string
              const transformedSubitem = {
                id: firstSubitem.id,
                name: firstSubitem.name,
                type: "subitem" as const, // Fix: Use a literal type "subitem" instead of string
                parentId: itemId,
                groupId: '',
                groupTitle: '',
                columns: {} as Record<string, any>
              };
              
              // Transform column values into the expected format
              firstSubitem.column_values.forEach((cv: any) => {
                transformedSubitem.columns[cv.id] = {
                  id: cv.id,
                  type: cv.type || '',
                  value: cv.value || '',
                  text: cv.type === 'formula' && cv.display_value ? cv.display_value : cv.text || ''
                };
              });
              
              parsedData.subitems = [transformedSubitem];
            }
          } catch (subitemError) {
            console.error("Error fetching subitem structure:", subitemError);
          }
        }
      } else {
        console.log("No items found in the board or could not fetch item data");
        parsedData.columns = parsedData.columns.map(column => ({
          ...column,
          exampleValue: "N/A",
          itemId: "N/A",
          itemName: "N/A"
        }));
      }
    } catch (error) {
      console.error("Error fetching first line data:", error);
      parsedData.columns = parsedData.columns.map(column => ({
        ...column,
        exampleValue: "N/A",
        itemId: "N/A",
        itemName: "N/A"
      }));
    }

    return parsedData;
  } catch (error) {
    console.error("Error fetching board structure:", error);
    toast.error("Error fetching board structure: " + (error instanceof Error ? error.message : String(error)));
    return null;
  }
};
