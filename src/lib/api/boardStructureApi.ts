
import { MondayCredentials, ParsedBoardData } from "../types";
import { fetchFromMonday } from "./mondayApiClient";
import { toast } from "sonner";

/**
 * Fetches the basic structure of a board (columns, groups) without items
 */
export const fetchBoardStructure = async (
  credentials: MondayCredentials
): Promise<ParsedBoardData | null> => {
  try {
    const boardQuery = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
          id
          name
          columns {
            id
            title
            type
          }
          groups {
            id
            title
          }
        }
      }
    `;

    const boardResponse = await fetchFromMonday(boardQuery, credentials.apiToken);
    
    if (!boardResponse?.data?.boards || boardResponse.data.boards.length === 0) {
      toast.error("Error: Could not fetch board data");
      return null;
    }

    const board = boardResponse.data.boards[0];
    
    const parsedData: ParsedBoardData = {
      boardName: board.name,
      columns: board.columns || [],
      groups: board.groups || [],
      items: [],
      subitems: []
    };

    console.log("Fetched board structure:", {
      name: parsedData.boardName,
      columnsCount: parsedData.columns.length,
      groupsCount: parsedData.groups.length
    });

    return parsedData;
  } catch (error) {
    console.error("Error fetching board structure:", error);
    toast.error("Error fetching board structure: " + (error instanceof Error ? error.message : String(error)));
    return null;
  }
};
