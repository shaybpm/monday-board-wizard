
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBoardData } from "@/hooks/useBoardData";
import { useCalculation } from "@/hooks/useCalculation";
import { useTaskLoader } from "./calculation/useTaskLoader";
import { useAutoSave } from "./calculation/useAutoSave";
import { useState, useEffect } from "react";

export const useCalculationBuilder = () => {
  const { boardData, loadBoardData, isLoading: isBoardLoading } = useBoardData();
  const navigate = useNavigate();
  const { currentTask, setCurrentTask, loadingTask } = useTaskLoader();
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const calculation = useCalculation(currentTask);
  
  // Ensure board data is loaded - with improved error handling
  useEffect(() => {
    if (!boardData && !isLoadingBoard && currentTask) {
      setIsLoadingBoard(true);
      console.log("Board data missing, attempting to load it...");
      loadBoardData()
        .then(loadedData => {
          if (!loadedData) {
            console.error("Failed to load board data after attempt");
            toast.error("Missing board data. Please reconnect to Monday.com.");
            setTimeout(() => navigate("/"), 3000); // Redirect after showing error
          } else {
            console.log("Successfully loaded board data:", loadedData.boardName);
          }
        })
        .catch(error => {
          console.error("Error loading board data:", error);
          toast.error("Error loading board data. Please reconnect to Monday.com.");
          setTimeout(() => navigate("/"), 3000); // Redirect after showing error
        })
        .finally(() => {
          setIsLoadingBoard(false);
        });
    }
  }, [boardData, currentTask, loadBoardData, navigate]);
  
  // Get auto-save functionality
  const { handleAutoSave } = useAutoSave({
    currentTask,
    formula: calculation.formula,
    targetColumn: calculation.targetColumn
  });

  const handleBackToBoard = () => {
    // Save the current formula state
    handleAutoSave(true);
    navigate("/board");
  };

  const handleApplyFormula = () => {
    // Save the operation to the task
    if (handleAutoSave(true)) {
      toast.success("Formula saved and applied successfully!");
      navigate("/");
    } else {
      toast.error("Failed to save operation");
    }
  };

  // Process board data wrapper function that accepts board data
  const handleProcessBoard = (boardData: any) => {
    calculation.processBoardData(boardData);
  };

  // Get selected columns from currentTask or sessionStorage
  const selectedColumns = currentTask?.selectedColumns || 
    (sessionStorage.getItem("selectedColumns") ? 
      JSON.parse(sessionStorage.getItem("selectedColumns")!) : []);
  
  // Determine if we're in logic test mode based on task type
  const isLogicTestMode = currentTask?.taskType === "logicTest";

  return {
    boardData,
    currentTask,
    selectedColumns,
    isLogicTestMode,
    calculation,
    loadingTask: loadingTask || isLoadingBoard || isBoardLoading,
    handleBackToBoard,
    handleApplyFormula,
    handleProcessBoard,
    testCalculation: calculation.testCalculation
  };
};
