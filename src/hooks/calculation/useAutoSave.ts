
import { useEffect } from "react";
import { Task } from "@/types/task";
import { CalculationToken } from "@/types/calculation";
import { BoardColumn } from "@/lib/types";

interface AutoSaveProps {
  currentTask: Task | null;
  formula: CalculationToken[];
  targetColumn: BoardColumn | null;
}

export const useAutoSave = ({ currentTask, formula, targetColumn }: AutoSaveProps) => {
  const handleAutoSave = (shouldNavigate = false) => {
    if (!currentTask || (!formula.length && !targetColumn)) return false;

    try {
      const tasksData = localStorage.getItem("mondayTasks");
      if (!tasksData) return false;

      const tasks = JSON.parse(tasksData);
      
      const updatedTasks = tasks.map((task: Task) => {
        if (task.id === currentTask.id) {
          const selectedColumnIds = currentTask.selectedColumns || 
            (sessionStorage.getItem("selectedColumns") ? 
              JSON.parse(sessionStorage.getItem("selectedColumns")!) : []);
          
          const updatedTask = {
            ...task,
            boardConfigured: true,
            selectedColumns: selectedColumnIds,
            savedOperations: {
              formula,
              targetColumn
            }
          };
          
          console.log("Saving updated task:", updatedTask);
          return updatedTask;
        }
        return task;
      });
      
      localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
      
      const updatedCurrentTask: Task = {
        ...currentTask,
        boardConfigured: true,
        savedOperations: {
          formula,
          targetColumn
        }
      };
      
      sessionStorage.setItem("mondayCurrentTask", JSON.stringify(updatedCurrentTask));
      console.log("Saved operations for task:", updatedCurrentTask);
      
      return true;
    } catch (error) {
      console.error("Error saving operation:", error);
      return false;
    }
  };

  // Auto-save every 5 seconds if there are changes
  useEffect(() => {
    let autoSaveInterval: number | undefined;
    
    if (currentTask && formula.length > 0) {
      autoSaveInterval = window.setInterval(() => {
        handleAutoSave(false);
        console.log("Auto-saved operation formula");
      }, 5000);
    }
    
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [currentTask, formula]);

  return { handleAutoSave };
};
