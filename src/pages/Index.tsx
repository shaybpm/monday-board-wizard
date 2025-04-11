
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MondayCredentials, ParsedBoardData } from "@/lib/types";
import Image from "@/components/ui/image";
import { TaskTable } from "@/components/task-table/TaskTable";
import { Button } from "@/components/ui/button";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import { toast } from "sonner";
import { validateCredentials, fetchBoardStructure } from "@/lib/mondayAPI";
import { Save, SaveAll, Download, Upload } from "lucide-react";
import TemplateLoadButton from "@/components/TemplateLoadButton";

export interface Task {
  id: string;
  title: string;
  sourceBoard: string;
  destinationBoard: string;
  savedOperations?: {
    formula: Array<{
      id: string;
      type: string;
      value: string;
      display: string;
    }>;
    targetColumn?: {
      id: string;
      title: string;
      type: string;
    };
  };
}

// Interface for saved task templates
export interface SavedTaskTemplate {
  name: string;
  tasks: Task[];
  apiToken?: string;
  dateCreated: string;
}

const Index = () => {
  const [apiToken, setApiToken] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "01", title: "", sourceBoard: "", destinationBoard: "" }
  ]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [savedTemplates, setSavedTemplates] = useState<SavedTaskTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<SavedTaskTemplate | null>(null);
  const navigate = useNavigate();

  // Check for existing API token and tasks on mount
  useEffect(() => {
    const storedApiToken = localStorage.getItem("mondayApiToken");
    if (storedApiToken) {
      setApiToken(storedApiToken);
    }
    
    // Load previously entered tasks if they exist
    const storedTasks = localStorage.getItem("mondayTasks");
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          setTasks(parsedTasks);
        }
      } catch (e) {
        console.error("Error parsing stored tasks:", e);
      }
    }

    // Load saved templates
    const storedTemplates = localStorage.getItem("mondaySavedTemplates");
    if (storedTemplates) {
      try {
        const parsedTemplates = JSON.parse(storedTemplates);
        if (Array.isArray(parsedTemplates)) {
          setSavedTemplates(parsedTemplates);
        }
      } catch (e) {
        console.error("Error parsing saved templates:", e);
      }
    }
  }, []);

  const addTask = () => {
    const newId = tasks.length + 1;
    // Format ID to always be 2 digits (e.g., 01, 02, ... 10, 11)
    const formattedId = newId.toString().padStart(2, "0");
    
    const newTasks = [
      ...tasks,
      { id: formattedId, title: "", sourceBoard: "", destinationBoard: "" }
    ];
    
    setTasks(newTasks);
    
    // Save tasks to localStorage whenever they change
    localStorage.setItem("mondayTasks", JSON.stringify(newTasks));
  };

  const updateTask = (id: string, field: keyof Task, value: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    );
    
    setTasks(updatedTasks);
    localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
      
      // If we're removing the currently selected task, clear the selection
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

  const saveTasksAsTemplate = () => {
    if (!saveTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    // Check if we're updating an existing template
    if (currentTemplate && currentTemplate.name === saveTemplateName) {
      // Update existing template
      const updatedTemplates = savedTemplates.map(template => 
        template.name === saveTemplateName 
          ? {
              ...template,
              tasks: [...tasks],
              apiToken: apiToken,
              dateCreated: new Date().toISOString()
            }
          : template
      );
      
      setSavedTemplates(updatedTemplates);
      localStorage.setItem("mondaySavedTemplates", JSON.stringify(updatedTemplates));
      toast.success(`Template "${saveTemplateName}" updated successfully`);
    } else {
      // Create new template
      const newTemplate: SavedTaskTemplate = {
        name: saveTemplateName,
        tasks: [...tasks],
        apiToken: apiToken,
        dateCreated: new Date().toISOString()
      };

      const updatedTemplates = [...savedTemplates, newTemplate];
      setSavedTemplates(updatedTemplates);
      localStorage.setItem("mondaySavedTemplates", JSON.stringify(updatedTemplates));
      setCurrentTemplate(newTemplate);
      toast.success(`Template "${saveTemplateName}" saved successfully`);
    }
    
    setIsSaveDialogOpen(false);
  };

  const loadTemplate = (template: SavedTaskTemplate) => {
    setTasks(template.tasks);
    localStorage.setItem("mondayTasks", JSON.stringify(template.tasks));
    
    if (template.apiToken) {
      setApiToken(template.apiToken);
      localStorage.setItem("mondayApiToken", template.apiToken);
    }
    
    setCurrentTemplate(template);
    setSaveTemplateName(template.name);
    toast.success(`Template "${template.name}" loaded successfully`);
  };

  const deleteTemplate = (index: number) => {
    const templateToDelete = savedTemplates[index];
    const updatedTemplates = savedTemplates.filter((_, i) => i !== index);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem("mondaySavedTemplates", JSON.stringify(updatedTemplates));
    
    // Reset current template if we just deleted it
    if (currentTemplate && currentTemplate.name === templateToDelete.name) {
      setCurrentTemplate(null);
      setSaveTemplateName("");
    }
    
    toast.success("Template deleted");
  };

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
    <div className="min-h-screen relative bg-gray-50 p-4">
      <div className="absolute top-4 left-4">
        <Image 
          src="/lovable-uploads/a0e5aded-ac26-4982-99b0-c8dc02aea0af.png" 
          alt="BIM Project Management Logo" 
          className="h-16 w-auto"
        />
      </div>
      
      <div className="absolute top-4 right-4 flex gap-2">
        <TemplateLoadButton 
          savedTemplates={savedTemplates}
          onLoadTemplate={loadTemplate}
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setIsSaveDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {currentTemplate ? "Save Template" : "Save As"}
        </Button>
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
      </div>
      
      {/* Save Tasks Dialog */}
      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentTemplate && currentTemplate.name === saveTemplateName 
                ? "Update Template" 
                : "Save As New Template"}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <input
                type="text"
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="My Task Template"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              {currentTemplate && currentTemplate.name === saveTemplateName && (
                <Button
                  onClick={() => {
                    setSaveTemplateName(currentTemplate.name + " (Copy)");
                    setCurrentTemplate(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Save As New
                </Button>
              )}
              <Button
                onClick={saveTasksAsTemplate}
                className="bg-monday-blue hover:bg-monday-darkBlue"
              >
                <SaveAll className="mr-2 h-4 w-4" />
                {currentTemplate && currentTemplate.name === saveTemplateName
                  ? "Update Template" 
                  : "Save Template"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
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
