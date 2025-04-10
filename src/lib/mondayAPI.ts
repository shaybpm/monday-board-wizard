
import { MondayCredentials, ParsedBoardData } from "./types";
import { toast } from "sonner";

const baseUrl = "https://api.monday.com/v2";

export const validateCredentials = async (credentials: MondayCredentials): Promise<boolean> => {
  try {
    const query = `query { boards(ids: ${credentials.sourceBoard}) { name } }`;
    const response = await fetchFromMonday(query, credentials.apiToken);
    return response?.data?.boards && response.data.boards.length > 0;
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
};

export const fetchBoardStructure = async (
  credentials: MondayCredentials
): Promise<ParsedBoardData | null> => {
  try {
    // Start with a simpler query that just gets the board name and ID
    const boardQuery = `
      query {
        boards(ids: ${credentials.sourceBoard}) {
          id
          name
        }
      }
    `;

    const boardResponse = await fetchFromMonday(boardQuery, credentials.apiToken);
    
    if (!boardResponse?.data?.boards || boardResponse.data.boards.length === 0) {
      toast.error("Error: Could not fetch board data");
      return null;
    }

    const board = boardResponse.data.boards[0];
    
    // Create a minimal parsed data structure with just the board name
    const parsedData: ParsedBoardData = {
      boardName: board.name,
      columns: [],
      groups: [],
      items: [],
      subitems: []
    };

    return parsedData;
  } catch (error) {
    console.error("Error fetching board structure:", error);
    toast.error("Error fetching board structure: " + (error instanceof Error ? error.message : String(error)));
    return null;
  }
};

async function fetchFromMonday(query: string, apiToken: string) {
  try {
    console.log("Sending query to Monday API:", query);
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error ${response.status}: ${errorText}`);
      throw new Error(`HTTP error ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log("Monday API response:", JSON.stringify(jsonResponse, null, 2));
    
    // Check for GraphQL errors
    if (jsonResponse.errors) {
      console.error("GraphQL errors:", JSON.stringify(jsonResponse.errors));
      throw new Error(`GraphQL error: ${jsonResponse.errors[0].message}`);
    }
    
    return jsonResponse;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}
