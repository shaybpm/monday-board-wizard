
import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { toast } from "sonner";

export function useTaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "01", title: "", sourceBoard: "", destinationBoard: "", taskType: "calculation" }
  ]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("mondayTasks");
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          // Ensure all tasks have a valid taskType field
          const updatedTasks = parsedTasks.map(task => ({
            ...task,
            // Ensure taskType is one of the valid types, defaulting to "calculation"
            taskType: task.taskType === "logicTest" ? "logicTest" : "calculation"
          })) as Task[];
          
          setTasks(updatedTasks);
        }
      } catch (e) {
        console.error("Error parsing stored tasks:", e);
      }
    }
  }, []);

  const addTask = () => {
    const newId = tasks.length + 1;
    const formattedId = newId.toString().padStart(2, "0");
    
    const newTasks = [
      ...tasks,
      { id: formattedId, title: "", sourceBoard: "", destinationBoard: "", taskType: "calculation" as const }
    ];
    
    setTasks(newTasks);
    localStorage.setItem("mondayTasks", JSON.stringify(newTasks));
  };

  const updateTask = (id: string, field: keyof Task, value: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        // For taskType field, ensure it's a valid value
        if (field === "taskType") {
          const safeTaskType = value === "logicTest" ? "logicTest" as const : "calculation" as const;
          return { ...task, [field]: safeTaskType };
        }
        // For other fields, update normally
        return { ...task, [field]: value };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
      
      if (selectedTaskId === id) {
        setSelectedTaskId(null);
      }
    } else {
      toast.error("You must have at least one task");
    }
  };

  const selectTask = (id: string) => {
    setSelectedTaskId(id);
  };

  return {
    tasks,
    setTasks,
    selectedTaskId, 
    setSelectedTaskId,
    addTask,
    updateTask,
    removeTask,
    selectTask
  };
}
