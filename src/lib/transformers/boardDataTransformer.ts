
import { BoardItem, ParsedBoardData } from "@/lib/types";

/**
 * Transforms API response data into the standardized format used by the app
 */
export const transformBoardData = (
  fetchedBoardData: ParsedBoardData,
  items: any[],
  subitems: any[]
): ParsedBoardData => {
  // Transform items into the expected format
  const transformedItems = items.map((item: any) => {
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
      transformedItem.columns[cv.id] = {
        id: cv.id,
        title: cv.title || cv.id, // Add title property (use id as fallback)
        type: cv.type || '',
        value: cv.value || '',
        text: cv.text || ''
      };
    });
    
    return transformedItem;
  });
  
  // Transform subitems into the expected format
  const transformedSubitems = subitems.map((subitem: any) => {
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
    subitem.column_values.forEach((cv: any) => {
      transformedSubitem.columns[cv.id] = {
        id: cv.id,
        title: cv.title || cv.id, // Add title property (use id as fallback)
        type: cv.type || '',
        value: cv.value || '',
        text: cv.text || ''
      };
    });
    
    return transformedSubitem;
  });
  
  // Update board data with transformed items and subitems
  return {
    ...fetchedBoardData,
    items: transformedItems,
    subitems: transformedSubitems
  };
};
