
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBoardData } from "@/hooks/useBoardData";
import { useCalculation } from "@/hooks/useCalculation";
import { useTaskLoader } from "./calculation/useTaskLoader";
import { useAutoSave } from "./calculation/useAutoSave";

export const useCalculationBuilder = () => {
  const { boardData } = useBoardData();
  const navigate = useNavigate();
  const { currentTask, setCurrentTask, loadingTask } = useTaskLoader();
  const calculation = useCalculation(currentTask);
  
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

  return {
    boardData,
    currentTask,
    calculation,
    loadingTask,
    handleBackToBoard,
    handleApplyFormula,
    handleProcessBoard: calculation.processBoard,
    testCalculation: calculation.testCalculation
  };
};
