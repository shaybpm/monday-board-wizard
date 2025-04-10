
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
    // Fetch board information (name, columns, groups)
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
    
    // Now fetch the items separately since the Monday API doesn't allow items in the same query as board structure
    const itemsQuery = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
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
            }
          }
        }
      }
    `;
    
    const itemsResponse = await fetchFromMonday(itemsQuery, credentials.apiToken);
    
    if (!itemsResponse?.data?.boards || itemsResponse.data.boards.length === 0) {
      toast.error("Error: Could not fetch board items");
      return null;
    }
    
    // Finally, fetch subitems in a separate query if needed
    const subitems = [];
    if (itemsResponse.data.boards[0].items && itemsResponse.data.boards[0].items.length > 0) {
      for (const item of itemsResponse.data.boards[0].items) {
        const subitemsQuery = `
          query {
            items(ids: ${item.id}) {
              subitems {
                id
                name
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
        
        try {
          const subitemsResponse = await fetchFromMonday(subitemsQuery, credentials.apiToken);
          if (subitemsResponse?.data?.items && 
              subitemsResponse.data.items.length > 0 && 
              subitemsResponse.data.items[0].subitems) {
            subitems.push(...subitemsResponse.data.items[0].subitems.map((subitem: any) => ({
              ...subitem,
              parentId: item.id,
              group: item.group
            })));
          }
        } catch (error) {
          console.warn(`Could not fetch subitems for item ${item.id}:`, error);
          // Continue even if subitems fetch fails for one item
        }
      }
    }
    
    const parsedData: ParsedBoardData = {
      boardName: board.name,
      columns: board.columns,
      groups: board.groups,
      items: [],
      subitems: []
    };

    // Process items
    if (itemsResponse.data.boards[0].items) {
      itemsResponse.data.boards[0].items.forEach((item: any) => {
        const parsedItem = {
          id: item.id,
          name: item.name,
          groupId: item.group?.id || "",
          groupTitle: item.group?.title || "",
          type: 'item' as const,
          columns: {}
        };

        // Process column values for each item
        item.column_values.forEach((col: any) => {
          parsedItem.columns[col.id] = {
            id: col.id,
            title: col.title,
            type: col.type,
            value: col.text || (col.value ? JSON.parse(col.value) : null)
          };
        });

        parsedData.items.push(parsedItem);
      });
    }

    // Process subitems
    subitems.forEach((subitem: any) => {
      const parsedSubitem = {
        id: subitem.id,
        name: subitem.name,
        groupId: subitem.group?.id || "",
        groupTitle: subitem.group?.title || "",
        type: 'subitem' as const,
        parentId: subitem.parentId,
        columns: {}
      };

      // Process column values for each subitem
      subitem.column_values.forEach((col: any) => {
        parsedSubitem.columns[col.id] = {
          id: col.id,
          title: col.title,
          type: col.type,
          value: col.text || (col.value ? JSON.parse(col.value) : null)
        };
      });

      parsedData.subitems.push(parsedSubitem);
    });

    return parsedData;
  } catch (error) {
    console.error("Error fetching board structure:", error);
    toast.error("Error fetching board structure: " + (error instanceof Error ? error.message : String(error)));
    return null;
  }
};

async function fetchFromMonday(query: string, apiToken: string) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiToken}`
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return await response.json();
}
