
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { validateCredentials, fetchBoardStructureWithExamples } from "@/lib/mondayAPI";
import { Task } from "@/types/task";

interface TaskActionButtonsProps {
  selectedTaskId: string | null;
  tasks: Task[];
  apiToken: string;
  setIsApiDialogOpen: (isOpen: boolean) => void;
}

const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({ 
  selectedTaskId,
  tasks, 
  apiToken,
  setIsApiDialogOpen
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleProcessTasks = async () => {
    if (!selectedTaskId) {
      toast.error("Please select a task to process");
      return;
    }
    
    // Get the selected task
    const currentTask = tasks.find(task => task.id === selectedTaskId);
    
    if (!currentTask) {
      toast.error("Selected task not found");
      return;
    }
    
    // Validate task has minimum required fields
    if (!currentTask.title) {
      toast.error("Please enter a title for the task");
      return;
    }
    
    if (!currentTask.sourceBoard) {
      toast.error("Please enter a source board ID");
      return;
    }
    
    if (!apiToken) {
      toast.error("Please set your Monday API Token first");
      setIsApiDialogOpen(true);
      return;
    }
    
    const destBoard = currentTask.destinationBoard || currentTask.sourceBoard;
    
    const credentials = {
      apiToken,
      sourceBoard: currentTask.sourceBoard,
      destinationBoard: destBoard,
    };
    
    setIsLoading(true);
    
    try {
      // First validate credentials
      const isValid = await validateCredentials(credentials);
      
      if (!isValid) {
        toast.error("Invalid API token or board ID. Please check your credentials.");
        setIsLoading(false);
        return;
      }
      
      toast.info("Credentials validated! Fetching board structure...");
      
      // Then fetch board data
      const boardData = await fetchBoardStructureWithExamples(credentials);
      
      if (!boardData) {
        toast.error("Failed to fetch board data. Please check your credentials.");
        setIsLoading(false);
        return;
      }
      
      console.log("Selected task and board data:", currentTask, boardData);
      
      // Store tasks for later use
      localStorage.setItem("mondayTasks", JSON.stringify(tasks));
      
      // Store current task ID in localStorage 
      localStorage.setItem("mondaySelectedTaskId", selectedTaskId);
      
      // Store current task and board data in session storage - ensure it's properly persisted
      sessionStorage.setItem("mondayCredentials", JSON.stringify(credentials));
      sessionStorage.setItem("mondayBoardData", JSON.stringify(boardData));
      sessionStorage.setItem("mondayCurrentTask", JSON.stringify(currentTask));
      
      // Log to confirm task is stored
      console.log("Task stored in session:", currentTask);
      
      toast.success(`Board structure loaded: ${boardData.boardName}`);
      
      // Determine where to navigate based on task configuration
      if (currentTask.boardConfigured && currentTask.savedOperations) {
        // If operations have been defined, navigate to operation builder
        navigate("/operation");
      } else {
        // Default: go to board page for initial setup
        navigate("/board");
      }
      
    } catch (error) {
      console.error("Connection error:", error);
      let errorMessage = "Unknown error";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Connection failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowTime = () => {
    // Placeholder for executing all defined tasks
    toast.info("Executing all defined tasks...");
  };
  
  return (
    <div className="mt-6 flex justify-center space-x-4">
      <Button
        onClick={handleProcessTasks}
        className="bg-monday-blue hover:bg-monday-darkBlue w-full max-w-xs"
        disabled={isLoading || !selectedTaskId}
      >
        {isLoading ? (
          <>
            <span className="i-lucide-loader-2 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          "Tasks setup"
        )}
      </Button>
      <Button
        onClick={handleShowTime}
        className="bg-green-500 hover:bg-green-600 w-full max-w-xs"
        disabled={tasks.length === 0}
      >
        It's show time
      </Button>
    </div>
  );
};

export default TaskActionButtons;
