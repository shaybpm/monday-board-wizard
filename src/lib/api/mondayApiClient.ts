
import { toast } from "sonner";

export const baseUrl = "https://api.monday.com/v2";

export async function fetchFromMonday(query: string, apiToken: string, version: string = "2023-10") {
  try {
    console.log("Sending query to Monday API:", query);
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`,
        "API-Version": version
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
