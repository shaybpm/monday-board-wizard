
import { ParsedBoardData } from "@/lib/types";
import { transformItems } from "./itemTransformer";
import { transformSubitems } from "./subitemTransformer";

/**
 * Transforms API response data into the standardized format used by the app
 */
export const transformBoardData = (
  fetchedBoardData: ParsedBoardData,
  items: any[],
  subitems: any[]
): ParsedBoardData => {
  // Transform items and subitems using the specialized transformer functions
  const transformedItems = transformItems(items);
  const transformedSubitems = transformSubitems(subitems);
  
  console.log(`Transformed ${transformedItems.length} items and ${transformedSubitems.length} subitems`);
  
  // If we have subitems but no subitem columns, extract column definitions from subitems
  if (transformedSubitems.length > 0 && (!fetchedBoardData.subitemColumns || fetchedBoardData.subitemColumns.length === 0)) {
    console.log("Extracting subitem columns from subitems");
    
    // Get a sample subitem to extract column types
    const sampleSubitem = transformedSubitems[0];
    
    if (sampleSubitem && sampleSubitem.columns) {
      // Extract column info from the subitem
      const subitemColumns = Object.values(sampleSubitem.columns).map(col => {
        console.log(`Extracting column info: ${col.id}, title: ${col.title}`);
        return {
          id: col.id,
          title: col.title || col.id, // Use title from column or fall back to ID
          type: col.type,
          exampleValue: col.text || JSON.stringify(col.value) || "",
          itemId: sampleSubitem.id,
          itemName: sampleSubitem.name
        };
      });
      
      fetchedBoardData.subitemColumns = subitemColumns;
      console.log(`Extracted ${subitemColumns.length} subitem columns`);
    }
  }
  
  // Update board data with transformed items and subitems
  return {
    ...fetchedBoardData,
    items: transformedItems,
    subitems: transformedSubitems
  };
};
