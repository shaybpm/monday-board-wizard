
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoardStructure from "@/components/BoardStructure";
import { ParsedBoardData } from "@/lib/types";
import { toast } from "sonner";
import { Loader2, RefreshCw, ArrowLeft, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchBoardStructure, fetchDebugItems } from "@/lib/mondayAPI";
import DebugItemsTable from "@/components/DebugItemsTable";

const BoardPage = () => {
  const [boardData, setBoardData] = useState<ParsedBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugItems, setDebugItems] = useState<any[]>([]);
  const [debugLoading, setDebugLoading] = useState(false);
  const [showDebugData, setShowDebugData] = useState(false);
  const navigate = useNavigate();

  const loadBoardData = async () => {
    setIsLoading(true);
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      toast.error("No credentials found. Please connect to Monday.com first.");
      navigate("/");
      return;
    }

    try {
      const credentials = JSON.parse(storedCredentialsStr);
      const fetchedBoardData = await fetchBoardStructure(credentials);
      
      if (fetchedBoardData) {
        setBoardData(fetchedBoardData);
        sessionStorage.setItem("mondayBoardData", JSON.stringify(fetchedBoardData));
      } else {
        toast.error("Failed to refresh board data.");
      }
    } catch (error) {
      console.error("Error refreshing board data:", error);
      toast.error("Error loading board data. Please reconnect to Monday.com.");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDebugData = async () => {
    setDebugLoading(true);
    setShowDebugData(true);
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      toast.error("No credentials found.");
      setDebugLoading(false);
      return;
    }
    
    try {
      const credentials = JSON.parse(storedCredentialsStr);
      // Fetch more items (20 instead of 10) to have more data for debugging
      const items = await fetchDebugItems(credentials, 20);
      setDebugItems(items);
    } catch (error) {
      console.error("Debug fetch error:", error);
      toast.error("Error fetching debug data");
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
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
          <Button 
            onClick={() => navigate('/')}
            variant="destructive"
          >
            Return to Connect Page
          </Button>
        </div>
      </div>
    );
  }

  // Calculate counts for the stats display
  const totalColumns = boardData.columns.length || 0;
  const itemColumnsCount = boardData.items.length || 0;
  const subitemsColumnsCount = boardData.subitems.length || 0;

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Header with board name and refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Source Board: {boardData.boardName}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowDebugData(!showDebugData);
              if (!debugItems.length && showDebugData === false) {
                fetchDebugData();
              }
            }}
            className="flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            {showDebugData ? "Hide Debug Data" : "Show Debug Data"}
          </Button>
          <Button 
            variant="outline" 
            onClick={loadBoardData} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-4 bg-gray-50 rounded-md p-4 border">
        <h3 className="text-lg font-medium mb-2">Board Summary</h3>
        <div className="flex flex-wrap gap-4">
          <div className="stat-item">
            <span className="text-sm text-gray-500">Total Columns:</span>
            <span className="ml-2 font-semibold">{totalColumns}</span>
          </div>
          <div className="stat-item">
            <span className="text-sm text-gray-500">Items:</span>
            <span className="ml-2 font-semibold">{itemColumnsCount}</span>
          </div>
          <div className="stat-item">
            <span className="text-sm text-gray-500">Subitems:</span>
            <span className="ml-2 font-semibold">{subitemsColumnsCount}</span>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Debug data table */}
      {showDebugData && (
        <DebugItemsTable 
          items={debugItems} 
          columns={boardData.columns} 
          isLoading={debugLoading}
        />
      )}

      {/* Board structure component */}
      <BoardStructure boardData={boardData} />
    </div>
  );
};

export default BoardPage;
