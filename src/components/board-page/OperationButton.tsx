
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
        
        // Only set boardConfigured flag if it's not already set
        if (!currentTask.boardConfigured) {
          currentTask.boardConfigured = true;
          sessionStorage.setItem("mondayCurrentTask", JSON.stringify(currentTask));
          
          // Also update in localStorage if needed
          const tasksData = localStorage.getItem("mondayTasks");
          if (tasksData) {
            const tasks = JSON.parse(tasksData);
            const updatedTasks = tasks.map((task: any) => {
              if (task.id === currentTask.id) {
                return {
                  ...task,
                  boardConfigured: true
                };
              }
              return task;
            });
            localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
          }
        }
        
        // Navigate programmatically
        navigate("/operation");
      } catch (error) {
        console.error("Error updating task data:", error);
        toast.error("Error updating task data");
      }
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
