
import { ParsedBoardData } from "@/lib/types";
import FetchAllDataButton from "./FetchAllDataButton";

interface BoardSummaryProps {
  boardData: ParsedBoardData;
  setBoardData: React.Dispatch<React.SetStateAction<ParsedBoardData | null>>;
}

const BoardSummary = ({ boardData, setBoardData }: BoardSummaryProps) => {
  const totalColumns = boardData?.columns?.length || 0;
  const itemCount = boardData?.items?.length || 0;
  const subitemCount = boardData?.subitems?.length || 0;

  return (
    <div className="mb-4 bg-gray-50 rounded-md p-4 border">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-2">Board Summary</h3>
          <div className="flex flex-wrap gap-4">
            <div className="stat-item">
              <span className="text-sm text-gray-500">Total Columns:</span>
              <span className="ml-2 font-semibold">{totalColumns}</span>
            </div>
            <div className="stat-item">
              <span className="text-sm text-gray-500">Items:</span>
              <span className="ml-2 font-semibold">{itemCount}</span>
            </div>
            {subitemCount > 0 && (
              <div className="stat-item">
                <span className="text-sm text-gray-500">Subitems:</span>
                <span className="ml-2 font-semibold">{subitemCount}</span>
              </div>
            )}
          </div>
        </div>
        <FetchAllDataButton setBoardData={setBoardData} />
      </div>
    </div>
  );
};

export default BoardSummary;
