import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBoardData } from "@/hooks/useBoardData";
import { Task } from "@/types/task";
import { BoardColumn } from "@/lib/types";
import { toast } from "sonner";
import { useCalculation } from "@/hooks/useCalculation";

export const useCalculationBuilder = () => {
  const { boardData } = useBoardData();
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<BoardColumn[]>([]);
  
  // Use our custom hook for calculation logic
  const calculation = useCalculation(currentTask);

  // Load current task info, selected columns, and any saved operations
  useEffect(() => {
    // Load task data
    const taskData = sessionStorage.getItem("mondayCurrentTask");
    if (taskData) {
      try {
        const parsedTask = JSON.parse(taskData);
        console.log("Loaded task data:", parsedTask);
        setCurrentTask(parsedTask);
        
        // If we have boardData, try to set columns based on stored column IDs
        if (boardData && boardData.columns) {
          // First check if we have columns from the current session
          const columnsData = sessionStorage.getItem("selectedColumns");
          if (columnsData) {
            const columnIds = JSON.parse(columnsData);
            if (Array.isArray(columnIds) && columnIds.length > 0) {
              const columns = boardData.columns.filter(col => columnIds.includes(col.id));
              setSelectedColumns(columns);
            }
          } 
          // If no session columns, try to get from the task itself
          else if (parsedTask.selectedColumns && Array.isArray(parsedTask.selectedColumns)) {
            const columns = boardData.columns.filter(col => 
              parsedTask.selectedColumns?.includes(col.id));
            setSelectedColumns(columns);
            
            // Also save these to session storage for consistency
            sessionStorage.setItem("selectedColumns", JSON.stringify(parsedTask.selectedColumns));
          }
          // Finally, if has saved operations but no selected columns, make all columns available
          else if (parsedTask.savedOperations) {
            setSelectedColumns(boardData.columns);
            
            // Store all column IDs for consistency
            const allColumnIds = boardData.columns.map(col => col.id);
            sessionStorage.setItem("selectedColumns", JSON.stringify(allColumnIds));
          }
        }
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    }
  }, [boardData]);

  const handleBackToBoard = () => {
    navigate("/board");
  };

  const handleApplyFormula = () => {
    // Save the operation to the task
    if (currentTask) {
      // Load all tasks
      const tasksData = localStorage.getItem("mondayTasks");
      if (tasksData) {
        try {
          const tasks = JSON.parse(tasksData);
          // Find the current task
          const updatedTasks = tasks.map((task: Task) => {
            if (task.id === currentTask.id) {
              // Keep existing selectedColumns if they exist
              const selectedColumnIds = currentTask.selectedColumns || 
                (sessionStorage.getItem("selectedColumns") ? 
                  JSON.parse(sessionStorage.getItem("selectedColumns")!) : []);
              
              // Save the formula and target column
              return {
                ...task,
                boardConfigured: true,
                selectedColumns: selectedColumnIds,
                savedOperations: {
                  formula: calculation.formula,
                  targetColumn: calculation.targetColumn
                }
              };
            }
            return task;
          });
          
          // Save updated tasks to localStorage
          localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
          
          // Also update current task in session storage
          const updatedCurrentTask = {
            ...currentTask,
            boardConfigured: true,
            savedOperations: {
              formula: calculation.formula,
              targetColumn: calculation.targetColumn
            }
          };
          sessionStorage.setItem("mondayCurrentTask", JSON.stringify(updatedCurrentTask));
          
          toast.success("Formula saved and applied successfully!");
          
          // Navigate to the landing page
          navigate("/");
        } catch (error) {
          console.error("Error saving operation:", error);
          toast.error("Failed to save operation");
        }
      }
    } else {
      toast.success("Formula applied successfully!");
      navigate("/");
    }
  };

  const handleProcessBoard = () => {
    if (!boardData) {
      toast.error("No board data available");
      return;
    }
    
    calculation.processBoardData(boardData);
  };

  const testCalculation = () => {
    // Make sure we pass the formula to the test function
    calculation.testCalculation();
  };

  // Determine if we're in logic test mode based on the current task
  const isLogicTestMode = currentTask?.taskType === "logicTest";

  return {
    boardData,
    currentTask,
    selectedColumns,
    calculation,
    isLogicTestMode,
    handleBackToBoard,
    handleApplyFormula,
    handleProcessBoard,
    testCalculation
  };
};
