
import { BoardItem } from "@/lib/types";

/**
 * Transforms API response subitems into the standardized format used by the app
 */
export const transformSubitems = (subitems: any[]): BoardItem[] => {
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
          
        transformedSubitem.columns[cv.id] = {
          id: cv.id,
          title: cv.title || cv.id, // Ensure title property is set (use id as fallback)
          type: cv.type || '',
          value: cv.value || '',
          text: displayText
        };
      });
    }
    
    return transformedSubitem;
  });
};
