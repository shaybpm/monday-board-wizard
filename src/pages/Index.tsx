
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MondayCredentials, ParsedBoardData } from "@/lib/types";
import Image from "@/components/ui/image";
import { TaskTable } from "@/components/task-table/TaskTable";
import { Button } from "@/components/ui/button";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { toast } from "sonner";
import { validateCredentials, fetchBoardStructure } from "@/lib/mondayAPI";

export interface Task {
  id: string;
  title: string;
  sourceBoard: string;
  destinationBoard: string;
}

const Index = () => {
  const [apiToken, setApiToken] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "01", title: "", sourceBoard: "", destinationBoard: "" }
  ]);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check for existing API token on mount
  useEffect(() => {
    const storedApiToken = localStorage.getItem("mondayApiToken");
    if (storedApiToken) {
      setApiToken(storedApiToken);
    }
  }, []);

  const addTask = () => {
    const newId = tasks.length + 1;
    // Format ID to always be 2 digits (e.g., 01, 02, ... 10, 11)
    const formattedId = newId.toString().padStart(2, "0");
    
    setTasks([
      ...tasks,
      { id: formattedId, title: "", sourceBoard: "", destinationBoard: "" }
    ]);
  };

  const updateTask = (id: string, field: keyof Task, value: string) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(task => task.id !== id));
    } else {
      toast.error("You must have at least one task");
    }
  };

  const handleProcessTasks = async () => {
    // Validate tasks
    const invalidTasks = tasks.filter(
      task => !task.title || !task.sourceBoard
    );
    
    if (invalidTasks.length > 0) {
      toast.error("Please fill in all required fields for each task");
      return;
    }
    
    if (!apiToken) {
      toast.error("Please set your Monday API Token first");
      setIsApiDialogOpen(true);
      return;
    }
    
    // Select first task to process
    const currentTask = tasks[0];
    const destBoard = currentTask.destinationBoard || currentTask.sourceBoard;
    
    const credentials: MondayCredentials = {
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
      localStorage.setItem("mondayCurrentTaskIndex", "0");
      
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
    <div className="min-h-screen relative bg-gray-50 p-4">
      <div className="absolute top-4 left-4">
        <Image 
          src="/lovable-uploads/a0e5aded-ac26-4982-99b0-c8dc02aea0af.png" 
          alt="BIM Project Management Logo" 
          className="h-16 w-auto"
        />
      </div>
      
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsApiDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <span className="i-lucide-key text-gray-600 w-4 h-4" />
          {apiToken ? "API Token" : "Set API Token"}
        </Button>
      </div>
      
      <div className="pt-24 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center text-monday-blue">
            Monday.com Board Tasks
          </h1>
          
          <TaskTable 
            tasks={tasks} 
            updateTask={updateTask} 
            addTask={addTask}
            removeTask={removeTask}
          />
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleProcessTasks}
              className="bg-monday-blue hover:bg-monday-darkBlue w-full max-w-xs"
              disabled={isLoading}
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
      </div>
      
      <ApiTokenDialog
        open={isApiDialogOpen}
        onOpenChange={setIsApiDialogOpen}
        apiToken={apiToken}
        setApiToken={setApiToken}
      />
    </div>
  );
};

export default Index;
