
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBoardData } from "@/hooks/useBoardData";
import { Task } from "@/types/task";
import { BoardColumn } from "@/lib/types";
import { toast } from "sonner";
import { useCalculation } from "@/hooks/useCalculation";
import { CalculationToken } from "@/types/calculation";

export const useCalculationBuilder = () => {
  const { boardData } = useBoardData();
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<BoardColumn[]>([]);
  const [loadingTask, setLoadingTask] = useState<boolean>(true);
  
  // Use our custom hook for calculation logic
  const calculation = useCalculation(currentTask);

  // Load current task info, selected columns, and any saved operations
  useEffect(() => {
    setLoadingTask(true);
    console.log("Loading task data in useCalculationBuilder...");
    
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
              console.log("Setting columns from session storage:", columnIds);
              const columns = boardData.columns.filter(col => columnIds.includes(col.id));
              setSelectedColumns(columns);
            }
          } 
          // If no session columns, try to get from the task itself
          else if (parsedTask.selectedColumns && Array.isArray(parsedTask.selectedColumns)) {
            console.log("Setting columns from task:", parsedTask.selectedColumns);
            const columns = boardData.columns.filter(col => 
              parsedTask.selectedColumns?.includes(col.id));
            setSelectedColumns(columns);
            
            // Also save these to session storage for consistency
            sessionStorage.setItem("selectedColumns", JSON.stringify(parsedTask.selectedColumns));
          }
          // Finally, if has saved operations but no selected columns, make all columns available
          else if (parsedTask.savedOperations) {
            console.log("Setting all columns for task with saved operations");
            setSelectedColumns(boardData.columns);
            
            // Store all column IDs for consistency
            const allColumnIds = boardData.columns.map(col => col.id);
            sessionStorage.setItem("selectedColumns", JSON.stringify(allColumnIds));
          }
        }
      } catch (error) {
        console.error("Error parsing task data:", error);
        toast.error("Failed to load task data");
        
        // Wait a moment before navigating away
        setTimeout(() => {
          navigate("/");
        }, 500);
      } finally {
        setLoadingTask(false);
      }
    } else {
      console.error("No task data found in session storage");
      toast.error("No task selected");
      
      // Try to load from localStorage if available
      const selectedTaskId = localStorage.getItem("mondaySelectedTaskId");
      const tasksData = localStorage.getItem("mondayTasks");
      
      if (selectedTaskId && tasksData) {
        try {
          const tasks = JSON.parse(tasksData);
          const task = tasks.find((t: Task) => t.id === selectedTaskId);
          
          if (task) {
            console.log("Recovered task from localStorage:", task);
            sessionStorage.setItem("mondayCurrentTask", JSON.stringify(task));
            setCurrentTask(task);
            setLoadingTask(false);
            return; // Exit early as we've recovered the task
          }
        } catch (error) {
          console.error("Error loading task from localStorage:", error);
        }
      }
      
      // If recovery failed, navigate back to the main screen
      setTimeout(() => {
        navigate("/");
      }, 500);
      setLoadingTask(false);
    }
  }, [boardData, navigate]);

  const handleBackToBoard = useCallback((shouldNavigate = true) => {
    // Save the current formula state regardless of navigation
    if (currentTask && (calculation.formula.length > 0 || calculation.targetColumn)) {
      saveCurrentOperations(false);
    }
    
    // Only navigate if requested
    if (shouldNavigate) {
      navigate("/board");
    }
  }, [currentTask, calculation.formula, calculation.targetColumn, navigate]);

  const handleApplyFormula = () => {
    // Save the operation to the task
    if (saveCurrentOperations(true)) {
      toast.success("Formula saved and applied successfully!");
      navigate("/");
    } else {
      toast.error("Failed to save operation");
    }
  };

  // Helper function to save current operations to the task
  const saveCurrentOperations = (showToast: boolean = false) => {
    if (!currentTask) {
      if (showToast) toast.error("No active task");
      return false;
    }

    try {
      // Load all tasks
      const tasksData = localStorage.getItem("mondayTasks");
      if (!tasksData) {
        if (showToast) toast.error("Tasks data not found");
        return false;
      }

      const tasks = JSON.parse(tasksData);
      
      // Find the current task
      const updatedTasks = tasks.map((task: Task) => {
        if (task.id === currentTask.id) {
          // Keep existing selectedColumns if they exist
          const selectedColumnIds = currentTask.selectedColumns || 
            (sessionStorage.getItem("selectedColumns") ? 
              JSON.parse(sessionStorage.getItem("selectedColumns")!) : []);
          
          // Save the formula and target column
          const updatedTask = {
            ...task,
            boardConfigured: true,
            selectedColumns: selectedColumnIds,
            savedOperations: {
              formula: calculation.formula,
              targetColumn: calculation.targetColumn
            }
          };
          
          console.log("Saving updated task:", updatedTask);
          return updatedTask;
        }
        return task;
      });
      
      // Save updated tasks to localStorage
      localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
      
      // Also update current task in session storage
      const updatedCurrentTask: Task = {
        ...currentTask,
        boardConfigured: true,
        savedOperations: {
          formula: calculation.formula,
          targetColumn: calculation.targetColumn
        }
      };
      
      sessionStorage.setItem("mondayCurrentTask", JSON.stringify(updatedCurrentTask));
      console.log("Saved operations for task:", updatedCurrentTask);
      setCurrentTask(updatedCurrentTask);
      
      return true;
    } catch (error) {
      console.error("Error saving operation:", error);
      return false;
    }
  };

  const handleProcessBoard = () => {
    // Before processing, save current operations
    saveCurrentOperations(false);
    
    if (!boardData) {
      toast.error("No board data available");
      return;
    }
    
    calculation.processBoardData(boardData);
  };

  const testCalculation = () => {
    // Save current operations before testing
    saveCurrentOperations(false);
    
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
    loadingTask,
    handleBackToBoard,
    handleApplyFormula,
    handleProcessBoard,
    testCalculation
  };
};
