
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import DebugDataSection from "./DebugDataSection";
import { ParsedBoardData } from "@/lib/types";

interface BoardHeaderProps {
  boardData: ParsedBoardData;
  isLoading: boolean;
  onRefresh: () => void;
}

const BoardHeader = ({ boardData, isLoading, onRefresh }: BoardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">
        Source Board: {boardData.boardName}
      </h2>
      <div className="flex gap-2">
        <DebugDataSection columns={boardData.columns} />
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default BoardHeader;
