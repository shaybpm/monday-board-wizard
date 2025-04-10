
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoardStructure from "@/components/BoardStructure";
import { ParsedBoardData } from "@/lib/types";
import { toast } from "../components/ui/sonner";
import { Loader2 } from "lucide-react";

const BoardPage = () => {
  const [boardData, setBoardData] = useState<ParsedBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get board data from session storage
    const storedBoardData = sessionStorage.getItem("mondayBoardData");
    
    if (!storedBoardData) {
      toast.error("No board data found. Please connect to Monday.com first.");
      navigate("/");
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedBoardData) as ParsedBoardData;
      setBoardData(parsedData);
    } catch (error) {
      console.error("Error parsing board data:", error);
      toast.error("Error loading board data. Please reconnect to Monday.com.");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-monday-blue" />
          <p className="mt-4 text-lg text-gray-600">Loading board data...</p>
        </div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-lg text-gray-600 mb-4">
            There was a problem loading your board data.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-monday-blue text-white rounded hover:bg-monday-darkBlue"
          >
            Return to Connect Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <BoardStructure boardData={boardData} />
    </div>
  );
};

export default BoardPage;
