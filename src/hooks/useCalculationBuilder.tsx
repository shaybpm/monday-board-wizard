
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
      } catch (error) {
        console.error("Error parsing task data:", error);
      }
    }

    // Load selected columns
    const columnsData = sessionStorage.getItem("selectedColumns");
    if (columnsData && boardData) {
      try {
        const columnIds = JSON.parse(columnsData);
        // If we have column IDs, use them, otherwise if a task has saved operations, use all columns
        if (Array.isArray(columnIds) && columnIds.length > 0) {
          const columns = boardData.columns.filter(col => columnIds.includes(col.id));
          setSelectedColumns(columns);
        } else if (boardData.columns && taskData) {
          // If no columns are selected but we're editing an existing operation, make all columns available
          const parsedTask = JSON.parse(taskData);
          if (parsedTask.savedOperations) {
            setSelectedColumns(boardData.columns);
          }
        }
      } catch (error) {
        console.error("Error parsing columns data:", error);
      }
    } else if (boardData && boardData.columns) {
      // If no columns are stored and we have a task with saved operations, make all columns available
      const taskData = sessionStorage.getItem("mondayCurrentTask");
      if (taskData) {
        try {
          const parsedTask = JSON.parse(taskData);
          if (parsedTask.savedOperations) {
            setSelectedColumns(boardData.columns);
          }
        } catch (error) {
          console.error("Error parsing task data:", error);
        }
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
              // Save the formula and target column
              return {
                ...task,
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
