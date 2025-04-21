
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Task } from "@/types/task";

export const useTaskLoader = () => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingTask(true);
    console.log("Loading task data in useTaskLoader...");
    
    const taskData = sessionStorage.getItem("mondayCurrentTask");
    if (taskData) {
      try {
        const parsedTask = JSON.parse(taskData);
        console.log("Loaded task data:", parsedTask);
        setCurrentTask(parsedTask);
      } catch (error) {
        console.error("Error parsing task data:", error);
        toast.error("Failed to load task data");
        setTimeout(() => navigate("/"), 500);
      }
    } else {
      console.error("No task data found in session storage");
      toast.error("No task selected");
      
      // Try to recover from localStorage
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
            return;
          }
        } catch (error) {
          console.error("Error loading task from localStorage:", error);
        }
      }
      setTimeout(() => navigate("/"), 500);
    }
    setLoadingTask(false);
  }, [navigate]);

  return { currentTask, setCurrentTask, loadingTask };
};
