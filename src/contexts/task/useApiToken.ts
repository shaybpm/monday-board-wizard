
import { useState, useEffect } from "react";

export function useApiToken() {
  const [apiToken, setApiToken] = useState<string>("");

  // Load API token from localStorage on mount
  useEffect(() => {
    const storedApiToken = localStorage.getItem("mondayApiToken");
    if (storedApiToken) {
      setApiToken(storedApiToken);
    }
  }, []);

  return { apiToken, setApiToken };
}
