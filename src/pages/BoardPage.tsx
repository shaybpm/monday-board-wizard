
import { useBoardData } from "@/hooks/useBoardData";
import BoardStructure from "@/components/BoardStructure";
import LoadingState from "@/components/board-page/LoadingState";
import ErrorState from "@/components/board-page/ErrorState";
import BoardHeader from "@/components/board-page/BoardHeader";
import BoardSummary from "@/components/board-page/BoardSummary";
import BackToConnectButton from "@/components/board-page/BackToConnectButton";
import OperationButton from "@/components/board-page/OperationButton";
import { useEffect, useState } from "react";
import { Task } from "@/pages/Index";

const BoardPage = () => {
  const { boardData, setBoardData, isLoading, loadBoardData } = useBoardData();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Load current task info
  useEffect(() => {
    const taskData = sessionStorage.getItem("mondayCurrentTask");
    if (taskData) {
      setCurrentTask(JSON.parse(taskData));
    }
  }, []);

  // Handle column selection state
  const handleColumnSelection = (columnIds: string[]) => {
    setSelectedColumns(columnIds);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!boardData) {
    return <ErrorState />;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">Task Setup</h1>
      
      {currentTask && (
        <div className="bg-blue-50 p-3 rounded-md mb-4 text-blue-800 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="font-semibold">Task {currentTask.id}:</span>
            <span>{currentTask.title}</span>
            <span>-</span>
            <span>Source Board: {boardData.boardName} ({currentTask.sourceBoard})</span>
          </div>
        </div>
      )}
      
      <BoardHeader 
        boardData={boardData} 
        isLoading={isLoading} 
        onRefresh={loadBoardData} 
      />

      <BoardSummary 
        boardData={boardData} 
        setBoardData={setBoardData} 
      />

      <BoardStructure 
        boardData={boardData} 
        onColumnSelection={handleColumnSelection}
      />
      
      <OperationButton 
        disabled={selectedColumns.length === 0}
        selectedColumns={selectedColumns}
      />
      
      <BackToConnectButton />
    </div>
  );
};

export default BoardPage;
