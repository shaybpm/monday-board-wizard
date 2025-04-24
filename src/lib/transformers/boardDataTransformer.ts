
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
  
  let subitemColumns = fetchedBoardData.subitemColumns || [];
  
  // If we have subitems but no subitem columns, extract column definitions from subitems
  if (transformedSubitems.length > 0 && subitemColumns.length === 0) {
    console.log("Extracting subitem columns from subitems");
    
    // Get a sample subitem to extract column types
    const sampleSubitem = transformedSubitems[0];
    
    if (sampleSubitem && sampleSubitem.columns) {
      // Extract column info from the subitem
      subitemColumns = Object.values(sampleSubitem.columns).map(col => {
        const colTitle = col.title || col.id; // Ensure we have a title
        console.log(`Extracting column info: ${col.id}, title: ${colTitle}`);
        
        return {
          id: col.id,
          title: colTitle,
          type: col.type || 'text',
          exampleValue: col.text || JSON.stringify(col.value) || "",
          itemId: sampleSubitem.id,
          itemName: sampleSubitem.name
        };
      });
      
      console.log(`Extracted ${subitemColumns.length} subitem columns`);
    }
  }
  
  // Update board data with transformed items, subitems, and extracted subitem columns
  return {
    ...fetchedBoardData,
    items: transformedItems,
    subitems: transformedSubitems,
    subitemColumns: subitemColumns
  };
};
