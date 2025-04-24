
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
    const transformedSubitem: BoardItem = {
      id: subitem.id,
      name: subitem.name,
      type: "subitem",
      parentId: subitem.parent_item?.id || '',
      groupId: '',
      groupTitle: '',
      columns: {}
    };
    
    // Transform column values into the expected format
    if (subitem.column_values && Array.isArray(subitem.column_values)) {
      subitem.column_values.forEach((cv: any) => {
        // For formula columns, use display_value if available
        const displayText = cv.type === 'formula' && cv.display_value ? 
          cv.display_value : cv.text || '';
          
        // Ensure we have a title for the column (use API provided title or fallback to ID)
        const columnTitle = cv.title || cv.id;
        
        console.log(`Subitem ${subitem.id} column ${cv.id} title: ${columnTitle}`);
          
        transformedSubitem.columns[cv.id] = {
          id: cv.id,
          title: columnTitle,
          type: cv.type || '',
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
