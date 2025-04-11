
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { ParsedBoardData } from "@/lib/types";
import { useFetchBoardData } from "@/hooks/useFetchBoardData";

interface FetchAllDataButtonProps {
  setBoardData: React.Dispatch<React.SetStateAction<ParsedBoardData | null>>;
}

const FetchAllDataButton = ({ setBoardData }: FetchAllDataButtonProps) => {
  const { fetchAllBoardData, isFetching, progress } = useFetchBoardData(setBoardData);

  return (
    <Button
      onClick={fetchAllBoardData}
      disabled={isFetching}
      variant="default"
      className="flex items-center gap-2"
    >
      {isFetching ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress.items > 0 && `(${progress.items} items, ${progress.subitems} subitems)`}
        </>
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isFetching ? "Fetching..." : "Fetch All Board Data"}
    </Button>
  );
};

export default FetchAllDataButton;
