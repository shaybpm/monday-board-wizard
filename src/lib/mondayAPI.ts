import { MondayCredentials, ParsedBoardData, BoardItem } from "./types";
import { toast } from "sonner";

const baseUrl = "https://api.monday.com/v2";

export const validateCredentials = async (credentials: MondayCredentials): Promise<boolean> => {
  try {
    const query = `query { boards(ids: ${credentials.sourceBoard}) { name } }`;
    const response = await fetchFromMonday(query, credentials.apiToken);
    return response?.data?.boards && response.data.boards.length > 0;
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
};

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
                }
                subitems {
                  id
                }
              }
            }
          }
        }
      `;

      const itemsResponse = await fetchFromMonday(itemsQuery, credentials.apiToken);
      
      if (itemsResponse?.data?.boards?.[0]?.items_page?.items?.[0]) {
        const firstItem = itemsResponse.data.boards[0].items_page.items[0];
        console.log("First item data:", firstItem);
        
        parsedData.columns = parsedData.columns.map(column => {
          const columnValue = firstItem.column_values.find(cv => cv.id === column.id);
          return {
            ...column,
            exampleValue: columnValue ? (columnValue.text || JSON.stringify(columnValue.value)) : "N/A"
          };
        });
      } else {
        console.log("No items found in the board or could not fetch item data");
        parsedData.columns = parsedData.columns.map(column => ({
          ...column,
          exampleValue: "N/A"
        }));
      }
    } catch (error) {
      console.error("Error fetching first line data:", error);
      parsedData.columns = parsedData.columns.map(column => ({
        ...column,
        exampleValue: "N/A"
      }));
    }

    return parsedData;
  } catch (error) {
    console.error("Error fetching board structure:", error);
    toast.error("Error fetching board structure: " + (error instanceof Error ? error.message : String(error)));
    return null;
  }
};

export const fetchDebugItems = async (
  credentials: MondayCredentials,
  limit: number = 20
): Promise<any[]> => {
  try {
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
                title
                text
                value
                type
              }
            }
          }
        }
      }
    `;
    
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

async function fetchFromMonday(query: string, apiToken: string) {
  try {
    console.log("Sending query to Monday API:", query);
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error ${response.status}: ${errorText}`);
      throw new Error(`HTTP error ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log("Monday API response:", JSON.stringify(jsonResponse, null, 2));
    
    if (jsonResponse.errors) {
      console.error("GraphQL errors:", JSON.stringify(jsonResponse.errors));
      throw new Error(`GraphQL error: ${jsonResponse.errors[0].message}`);
    }
    
    return jsonResponse;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}
