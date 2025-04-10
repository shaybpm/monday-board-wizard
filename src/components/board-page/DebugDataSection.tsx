
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bug, ListTree } from "lucide-react";
import DebugItemsTable from "@/components/DebugItemsTable";
import { BoardColumn, DebugDataType } from "@/lib/types";
import { fetchDebugItems, fetchDebugSubitems } from "@/lib/mondayAPI";
import { toast } from "sonner";

interface DebugDataSectionProps {
  columns: BoardColumn[];
}

const DebugDataSection = ({ columns }: DebugDataSectionProps) => {
  const [debugItems, setDebugItems] = useState<any[]>([]);
  const [debugLoading, setDebugLoading] = useState(false);
  const [showDebugData, setShowDebugData] = useState(false);
  const [debugType, setDebugType] = useState<DebugDataType>("items");

  const fetchDebugData = async (type: DebugDataType = "items") => {
    setDebugLoading(true);
    setShowDebugData(true);
    setDebugType(type);
    const storedCredentialsStr = sessionStorage.getItem("mondayCredentials");
    
    if (!storedCredentialsStr) {
      toast.error("No credentials found.");
      setDebugLoading(false);
      return;
    }
    
    try {
      const credentials = JSON.parse(storedCredentialsStr);
      
      if (type === "items") {
        const items = await fetchDebugItems(credentials, 20);
        setDebugItems(items);
      } else {
        const subitems = await fetchDebugSubitems(credentials, 20);
        setDebugItems(subitems);
      }
    } catch (error) {
      console.error(`Debug fetch error (${type}):`, error);
      toast.error(`Error fetching debug ${type}`);
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowDebugData(!showDebugData);
            if (!debugItems.length && showDebugData === false) {
              fetchDebugData(debugType);
            }
          }}
          className="flex items-center gap-2"
        >
          <Bug className="h-4 w-4" />
          {showDebugData ? "Hide Debug Data" : "Show Debug Data"}
        </Button>
        {showDebugData && (
          <Button
            variant="outline"
            onClick={() => fetchDebugData("items")}
            className="flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            Debug Items
          </Button>
        )}
        {showDebugData && (
          <Button
            variant="outline"
            onClick={() => fetchDebugData("subitems")}
            className="flex items-center gap-2"
          >
            <ListTree className="h-4 w-4" />
            Debug Subitems
          </Button>
        )}
      </div>

      {showDebugData && (
        <DebugItemsTable 
          items={debugItems} 
          columns={columns} 
          isLoading={debugLoading}
          type={debugType}
        />
      )}
    </>
  );
};

export default DebugDataSection;
