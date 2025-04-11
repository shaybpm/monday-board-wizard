
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
  
  // Update board data with transformed items and subitems
  return {
    ...fetchedBoardData,
    items: transformedItems,
    subitems: transformedSubitems
  };
};
