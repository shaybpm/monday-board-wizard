
import { BoardItem } from "@/lib/types";

/**
 * Transforms API response items into the standardized format used by the app
 */
export const transformItems = (items: any[]): BoardItem[] => {
  return items.map((item: any) => {
    const transformedItem: BoardItem = {
      id: item.id,
      name: item.name,
      type: "item",
      groupId: item.group?.id || '',
      groupTitle: item.group?.title || '',
      columns: {}
    };
    
    // Transform column values into the expected format
    item.column_values.forEach((cv: any) => {
      // For formula columns, use display_value if available
      const displayText = cv.type === 'formula' && cv.display_value ? 
        cv.display_value : cv.text || '';
        
      transformedItem.columns[cv.id] = {
        id: cv.id,
        title: cv.title || cv.id, // Add title property (use id as fallback)
        type: cv.type || '',
        value: cv.value || '',
        text: displayText
      };
    });
    
    return transformedItem;
  });
};
