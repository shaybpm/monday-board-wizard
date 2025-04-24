
import { BoardItem } from "@/lib/types";

/**
 * Transforms API response subitems into the standardized format used by the app
 */
export const transformSubitems = (subitems: any[]): BoardItem[] => {
  if (!subitems || subitems.length === 0) {
    console.log('No subitems to transform');
    return [];
  }

  console.log(`Transforming ${subitems.length} subitems`);
  
  return subitems.map((subitem: any) => {
    console.log(`Processing subitem: ${subitem.id}`);
    
    const transformedSubitem: BoardItem = {
      id: subitem.id,
      name: subitem.name || 'Unnamed Subitem',
      type: "subitem",
      parentId: subitem.parent_item?.id || '',
      groupId: '',
      groupTitle: '',
      columns: {}
    };
    
    // Transform column values into the expected format
    if (subitem.column_values && Array.isArray(subitem.column_values)) {
      subitem.column_values.forEach((cv: any) => {
        // Skip columns with no ID
        if (!cv.id) {
          console.warn(`Subitem column missing ID, skipping`);
          return;
        }
        
        // For formula columns, use display_value if available
        const displayText = cv.type === 'formula' && cv.display_value
          ? cv.display_value 
          : (cv.text || '');
          
        // Make sure we ALWAYS have a title for the column - this was a critical issue
        // First try the API provided title, then fallback to the ID
        const columnTitle = cv.title || cv.id;
        
        // Log key information about this column
        console.log(`Subitem ${subitem.id} column ${cv.id} title: ${columnTitle}, value: ${displayText}`);
        
        transformedSubitem.columns[cv.id] = {
          id: cv.id,
          title: columnTitle, // Store the title properly
          type: cv.type || 'text',
          value: cv.value || '',
          text: displayText
        };
      });
    } else {
      console.warn(`Subitem ${subitem.id} has no column_values array`);
    }
    
    return transformedSubitem;
  });
};
