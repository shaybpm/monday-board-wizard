
import { MondayCredentials } from "../types";
import { fetchFromMonday } from "./mondayApiClient";

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
