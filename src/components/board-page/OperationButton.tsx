
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Task } from "@/types/task";

interface OperationButtonProps {
  disabled: boolean;
  selectedColumns?: string[];
}

const OperationButton: React.FC<OperationButtonProps> = ({ disabled, selectedColumns = [] }) => {
  const navigate = useNavigate();
  
  const handleOperation = () => {
    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column");
      return;
    }
    
    // Store the selected columns in session storage for use in the calculation builder
    sessionStorage.setItem("selectedColumns", JSON.stringify(selectedColumns));
    
    // Update the current task to mark it as having gone through board setup
    const currentTaskData = sessionStorage.getItem("mondayCurrentTask");
    if (currentTaskData) {
      try {
        const currentTask = JSON.parse(currentTaskData);
        
        // Update with board configuration and selected columns
        const updatedTask: Task = {
          ...currentTask,
          boardConfigured: true,
          selectedColumns: selectedColumns
        };
        
        // Save back to session storage
        sessionStorage.setItem("mondayCurrentTask", JSON.stringify(updatedTask));
        console.log("Updated task with board config:", updatedTask);
        
        // Also update in localStorage tasks array
        const tasksData = localStorage.getItem("mondayTasks");
        if (tasksData) {
          const tasks = JSON.parse(tasksData);
          const updatedTasks = tasks.map((task: any) => {
            if (task.id === currentTask.id) {
              return {
                ...task,
                boardConfigured: true,
                selectedColumns: selectedColumns
              };
            }
            return task;
          });
          localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
          console.log("Updated tasks in localStorage with selected columns");
        }
        
        // Navigate programmatically
        navigate("/operation");
      } catch (error) {
        console.error("Error updating task data:", error);
        toast.error("Error updating task data");
      }
    } else {
      toast.error("No task selected. Please go back and select a task.");
      console.error("No currentTask in sessionStorage");
    }
  };

  return (
    <div className="mt-4">
      <Button
        className="w-full"
        size="lg"
        disabled={disabled}
        onClick={handleOperation}
      >
        <Calculator className="mr-2 h-5 w-5" />
        Continue to Operation Builder
      </Button>
    </div>
  );
};

export default OperationButton;
