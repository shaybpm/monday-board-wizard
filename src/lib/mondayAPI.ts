
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
    // Fetch board, columns, and groups
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
      }
    `;

    const response = await fetchFromMonday(boardQuery, credentials.apiToken);
    
    if (!response?.data?.boards || response.data.boards.length === 0) {
      toast.error("Error: Could not fetch board data");
      return null;
    }

    const board = response.data.boards[0];
    const parsedData: ParsedBoardData = {
      boardName: board.name,
      columns: board.columns,
      groups: board.groups,
      items: [],
      subitems: []
    };

    // Process items and subitems
    board.items.forEach((item: any) => {
      const parsedItem = {
        id: item.id,
        name: item.name,
        groupId: item.group.id,
        groupTitle: item.group.title,
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

      // Process subitems
      if (item.subitems && item.subitems.length > 0) {
        item.subitems.forEach((subitem: any) => {
          const parsedSubitem = {
            id: subitem.id,
            name: subitem.name,
            groupId: item.group.id,
            groupTitle: item.group.title,
            type: 'subitem' as const,
            parentId: item.id,
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
      }
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
