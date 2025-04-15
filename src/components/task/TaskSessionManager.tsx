
import React, { useEffect } from "react";

const TaskSessionManager: React.FC = () => {
  useEffect(() => {
    // When returning to main page, preserve task data in localStorage
    // but clear current task data in sessionStorage
    const currentTask = sessionStorage.getItem("mondayCurrentTask");
    if (currentTask) {
      try {
        // Save current task to localStorage before clearing
        const parsedTask = JSON.parse(currentTask);
        const tasksData = localStorage.getItem("mondayTasks");
        if (tasksData) {
          const tasks = JSON.parse(tasksData);
          const updatedTasks = tasks.map((task: any) => {
            if (task.id === parsedTask.id) {
              return {
                ...task,
                boardConfigured: parsedTask.boardConfigured,
                selectedColumns: parsedTask.selectedColumns,
                savedOperations: parsedTask.savedOperations
              };
            }
            return task;
          });
          localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
        }
      } catch (error) {
        console.error("Error saving task data:", error);
      }
    }
    
    // Now clear the session storage for a fresh task selection
    sessionStorage.removeItem("mondayCurrentTask");
    sessionStorage.removeItem("selectedColumns");
    sessionStorage.removeItem("calculationDebugInfo");
  }, []);
  
  return null; // This component doesn't render anything
};

export default TaskSessionManager;
