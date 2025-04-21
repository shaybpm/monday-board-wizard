
import React, { useEffect } from "react";
import { useTaskContext } from "@/contexts/TaskContext";

const TaskSessionManager: React.FC = () => {
  const { selectedTaskId, tasks } = useTaskContext();
  
  useEffect(() => {
    // MODIFIED: Only save task data to localStorage when needed, don't trigger page refresh

    // Only clear current task data in sessionStorage if we're on the main page
    // and not navigating between task-specific pages
    const path = window.location.pathname;
    if (path === "/" || path === "") {
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
            console.log("Task data saved to localStorage:", parsedTask.id);
          }
        } catch (error) {
          console.error("Error saving task data:", error);
        }
      }
    }
    
    // REMOVED: Don't clear session storage here - this was causing reloads
    // The session storage should only be cleared when navigating back to the home page
  }, []);
  
  // Log current selected task for debugging
  useEffect(() => {
    console.log("Current selected task ID:", selectedTaskId);
    if (selectedTaskId) {
      const currentTask = tasks.find(task => task.id === selectedTaskId);
      console.log("Current task data:", currentTask);
    }
  }, [selectedTaskId, tasks]);
  
  return null; // This component doesn't render anything
};

export default TaskSessionManager;
