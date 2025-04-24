
import { ParsedBoardData } from "../types";
import { fetchFromMonday } from "./mondayApiClient";

/**
 * Fetches subitem data for a parent item and enriches the board data with it
 */
export const fetchSubitemData = async (
  apiToken: string,
  itemId: string,
  parsedData: ParsedBoardData
): Promise<ParsedBoardData> => {
  try {
    // Fetch subitem data
    const subitemQuery = `
      query {
        items(ids: [${itemId}]) {
          subitems {
            id
            name
            parent_item {
              id
              name
            }
            column_values {
              id
              text
              value
              type
              title
              ... on FormulaValue {
                display_value
              }
            }
          }
        }
      }
    `;
    
    console.log("Fetching subitem data for structure...");
    const subitemResponse = await fetchFromMonday(subitemQuery, apiToken, "2025-01");
    
    if (subitemResponse?.data?.items?.[0]?.subitems?.length > 0) {
      const firstSubitem = subitemResponse.data.items[0].subitems[0];
      console.log("First subitem data:", firstSubitem);
      console.log("First subitem column values:", firstSubitem.column_values);
      
      // Store the subitem columns separately
      const subitemColumns = firstSubitem.column_values.map((cv: any) => {
        // Use display_value for formula type columns if available
        const exampleValue = cv.type === 'formula' && cv.display_value ? 
          cv.display_value : 
          (cv.text || JSON.stringify(cv.value) || "N/A");
        
        // Log column title information for debugging
        console.log(`Subitem column ${cv.id} title: ${cv.title || 'undefined'}`);
        
        return {
          id: cv.id,
          title: cv.title || cv.id, // Use the title from the API if available
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
        type: "subitem" as const,
        parentId: itemId,
        groupId: '',
        groupTitle: '',
        columns: {} as Record<string, any>
      };
      
      // Transform column values into the expected format
      firstSubitem.column_values.forEach((cv: any) => {
        transformedSubitem.columns[cv.id] = {
          id: cv.id,
          title: cv.title || cv.id, // Ensure title property is set with the actual title
          type: cv.type || '',
          value: cv.value || '',
          text: cv.type === 'formula' && cv.display_value ? cv.display_value : cv.text || ''
        };
      });
      
      parsedData.subitems = [transformedSubitem];
    }
    
    return parsedData;
  } catch (subitemError) {
    console.error("Error fetching subitem structure:", subitemError);
    return parsedData;
  }
};
