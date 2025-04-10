
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { fetchBoardStructure, fetchDebugItems, fetchDebugSubitems } from "@/lib/mondayAPI";
import { ParsedBoardData } from "@/lib/types";

interface FetchAllDataButtonProps {
  setBoardData: React.Dispatch<React.SetStateAction<ParsedBoardData | null>>;
}

const FetchAllDataButton = ({ setBoardData }: FetchAllDataButtonProps) => {
  const [isFetching, setIsFetching] = useState(false);

  const fetchAllBoardData = async () => {
    setIsFetching(true);
    toast.info("Fetching all board data...");
    
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      toast.error("No credentials found. Please connect to Monday.com first.");
      setIsFetching(false);
      return;
    }
    
    try {
      const credentials = JSON.parse(storedCredentialsStr);
      
      // First fetch board structure
      const fetchedBoardData = await fetchBoardStructure(credentials);
      
      if (fetchedBoardData) {
        // Then fetch items and subitems
        const items = await fetchDebugItems(credentials, 100);
        const subitems = await fetchDebugSubitems(credentials, 100);
        
        // Log summary data
        const summary = {
          boardName: fetchedBoardData.boardName,
          totalItems: items.length,
          totalSubitems: subitems.length,
          columns: fetchedBoardData.columns.length,
          subitemColumns: fetchedBoardData.subitemColumns?.length || 0
        };
        
        console.log("Board data summary:", summary);
        
        toast.success(`Fetched ${items.length} items and ${subitems.length} subitems from the board.`);
        
        // Update board data
        if (!fetchedBoardData.subitems) {
          fetchedBoardData.subitems = [];
        }
        
        setBoardData(fetchedBoardData);
        sessionStorage.setItem("mondayBoardData", JSON.stringify(fetchedBoardData));
      } else {
        toast.error("Failed to fetch board data.");
      }
    } catch (error) {
      console.error("Error fetching all board data:", error);
      toast.error("Error fetching all board data. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Button
      onClick={fetchAllBoardData}
      disabled={isFetching}
      variant="default"
      className="flex items-center gap-2"
    >
      {isFetching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isFetching ? "Fetching..." : "Fetch All Board Data"}
    </Button>
  );
};

export default FetchAllDataButton;
