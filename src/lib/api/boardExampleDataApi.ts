
import { ParsedBoardData } from "../types";
import { fetchFromMonday } from "./mondayApiClient";

/**
 * Fetches a sample item and enriches columns with example values
 */
export const fetchExampleData = async (
  apiToken: string, 
  boardId: string, 
  parsedData: ParsedBoardData
): Promise<ParsedBoardData> => {
  try {
    // Fetch regular items data first
    const itemsQuery = `
      query {
        boards(ids: ${boardId}) {
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

    const itemsResponse = await fetchFromMonday(itemsQuery, apiToken, "2025-01");
    
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
      
      // Check if first item has subitems
      const hasSubitems = firstItem.subitems && firstItem.subitems.length > 0;
      return hasSubitems ? parsedData : addDefaultExampleValues(parsedData);
    } else {
      console.log("No items found in the board or could not fetch item data");
      return addDefaultExampleValues(parsedData);
    }
  } catch (error) {
    console.error("Error fetching first line data:", error);
    return addDefaultExampleValues(parsedData);
  }
};

/**
 * Adds default example values when no items are found
 */
const addDefaultExampleValues = (parsedData: ParsedBoardData): ParsedBoardData => {
  return {
    ...parsedData,
    columns: parsedData.columns.map(column => ({
      ...column,
      exampleValue: "N/A",
      itemId: "N/A",
      itemName: "N/A"
    }))
  };
};
