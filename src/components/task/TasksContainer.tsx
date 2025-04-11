
import React from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskTable } from "@/components/task-table/TaskTable";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { validateCredentials, fetchBoardStructure } from "@/lib/mondayAPI";

interface TasksContainerProps {
  setIsApiDialogOpen: (isOpen: boolean) => void;
}

const TasksContainer: React.FC<TasksContainerProps> = ({ setIsApiDialogOpen }) => {
  const { 
    tasks, 
    selectedTaskId, 
    apiToken, 
    updateTask, 
    addTask, 
    removeTask, 
    selectTask 
  } = useTaskContext();
  
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
    
    // Validate task
    if (!currentTask.title || !currentTask.sourceBoard) {
      toast.error("Please fill in all required fields for the selected task");
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
      const isValid = await validateCredentials(credentials);
      
      if (!isValid) {
        toast.error("Invalid API token or board ID. Please check your credentials.");
        setIsLoading(false);
        return;
      }
      
      toast.info("Credentials validated! Fetching board structure...");
      
      const boardData = await fetchBoardStructure(credentials);
      
      if (!boardData) {
        toast.error("Failed to fetch board data. Please check your credentials.");
        setIsLoading(false);
        return;
      }
      
      // Store tasks for later use
      localStorage.setItem("mondayTasks", JSON.stringify(tasks));
      localStorage.setItem("mondayCurrentTaskIndex", tasks.findIndex(task => task.id === selectedTaskId).toString());
      
      // Store current task data in session storage
      sessionStorage.setItem("mondayCredentials", JSON.stringify(credentials));
      sessionStorage.setItem("mondayBoardData", JSON.stringify(boardData));
      sessionStorage.setItem("mondayCurrentTask", JSON.stringify(currentTask));
      
      toast.success(`Board structure loaded: ${boardData.boardName}`);
      navigate("/board");
      
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
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-monday-blue">
        Monday.com Board Tasks
      </h1>
      
      <TaskTable 
        tasks={tasks} 
        updateTask={updateTask} 
        addTask={addTask}
        removeTask={removeTask}
        selectedTaskId={selectedTaskId}
        onSelectTask={selectTask}
      />
      
      <div className="mt-6 flex justify-center">
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
            "Let's Do This"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TasksContainer;
