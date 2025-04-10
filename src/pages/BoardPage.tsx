
import { useBoardData } from "@/hooks/useBoardData";
import BoardStructure from "@/components/BoardStructure";
import LoadingState from "@/components/board-page/LoadingState";
import ErrorState from "@/components/board-page/ErrorState";
import BoardHeader from "@/components/board-page/BoardHeader";
import BoardSummary from "@/components/board-page/BoardSummary";
import BackToConnectButton from "@/components/board-page/BackToConnectButton";

const BoardPage = () => {
  const { boardData, setBoardData, isLoading, loadBoardData } = useBoardData();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!boardData) {
    return <ErrorState />;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <BoardHeader 
        boardData={boardData} 
        isLoading={isLoading} 
        onRefresh={loadBoardData} 
      />

      <BoardSummary 
        boardData={boardData} 
        setBoardData={setBoardData} 
      />

      <BackToConnectButton />
      
      <BoardStructure boardData={boardData} />
    </div>
  );
};

export default BoardPage;
