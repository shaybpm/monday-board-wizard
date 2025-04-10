
import { useState, useEffect } from "react";
import ConnectForm from "@/components/ConnectForm";
import { MondayCredentials, ParsedBoardData } from "@/lib/types";

const Index = () => {
  const [credentials, setCredentials] = useState<MondayCredentials | null>(null);
  const [boardData, setBoardData] = useState<ParsedBoardData | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedCredentials = sessionStorage.getItem("mondayCredentials");
    const storedBoardData = sessionStorage.getItem("mondayBoardData");
    
    if (storedCredentials && storedBoardData) {
      try {
        setCredentials(JSON.parse(storedCredentials));
        setBoardData(JSON.parse(storedBoardData));
      } catch (error) {
        console.error("Error parsing stored session:", error);
        sessionStorage.removeItem("mondayCredentials");
        sessionStorage.removeItem("mondayBoardData");
      }
    }
  }, []);

  const handleConnect = (creds: MondayCredentials, data: ParsedBoardData) => {
    setCredentials(creds);
    setBoardData(data);
  };

  return (
    <div className="min-h-screen">
      <ConnectForm onConnect={handleConnect} />
    </div>
  );
};

export default Index;
