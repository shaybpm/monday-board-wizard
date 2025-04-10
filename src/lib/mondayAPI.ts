
import { MondayCredentials, ParsedBoardData } from "./types";
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
    // Fetch basic board structure first
    const boardQuery = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
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
    
    // Now fetch at least one item with all its column values
    const itemsQuery = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
          items(limit: 1) {
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
            }
          }
        }
      }
    `;

    const itemsResponse = await fetchFromMonday(itemsQuery, credentials.apiToken);
    
    // Create parsed data with the structure and the first item
    let parsedData: ParsedBoardData = {
      boardName: board.name,
      columns: board.columns,
      groups: board.groups,
      items: [],
      subitems: []
    };

    // Process items if available
    if (itemsResponse?.data?.boards?.[0]?.items?.length > 0) {
      const items = itemsResponse.data.boards[0].items;
      
      parsedData.items = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        groupId: item.group.id,
        groupTitle: item.group.title,
        type: 'item',
        columns: item.column_values.reduce((acc: any, col: any) => {
          acc[col.id] = {
            id: col.id,
            title: col.title,
            type: col.type,
            value: col.value,
            text: col.text
          };
          return acc;
        }, {})
      }));

      // Update example values in columns based on the first item
      if (parsedData.items.length > 0) {
        const firstItem = parsedData.items[0];
        parsedData.columns = parsedData.columns.map(col => {
          const columnData = firstItem.columns[col.id];
          return {
            ...col,
            exampleValue: columnData ? (columnData.text || JSON.stringify(columnData.value)) : undefined
          };
        });
      }
    }

    return parsedData;
  } catch (error) {
    console.error("Error fetching board structure:", error);
    toast.error("Error fetching board structure: " + (error instanceof Error ? error.message : String(error)));
    return null;
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
    
    // Check for GraphQL errors
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
