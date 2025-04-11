import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { SavedTaskTemplate, Task } from "@/types/task";

interface TaskContextProps {
  tasks: Task[];
  selectedTaskId: string | null;
  apiToken: string;
  currentTemplate: SavedTaskTemplate | null;
  saveTemplateName: string;
  savedTemplates: SavedTaskTemplate[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setApiToken: React.Dispatch<React.SetStateAction<string>>;
  setCurrentTemplate: React.Dispatch<React.SetStateAction<SavedTaskTemplate | null>>;
  setSaveTemplateName: React.Dispatch<React.SetStateAction<string>>;
  setSavedTemplates: React.Dispatch<React.SetStateAction<SavedTaskTemplate[]>>;
  addTask: () => void;
  updateTask: (id: string, field: keyof Task, value: string) => void;
  removeTask: (id: string) => void;
  selectTask: (id: string) => void;
  saveTasksAsTemplate: () => void;
  loadTemplate: (template: SavedTaskTemplate) => void;
  deleteTemplate: (index: number) => void;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiToken, setApiToken] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "01", title: "", sourceBoard: "", destinationBoard: "" }
  ]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTaskTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<SavedTaskTemplate | null>(null);
  const [saveTemplateName, setSaveTemplateName] = useState("");

  useEffect(() => {
    const storedApiToken = localStorage.getItem("mondayApiToken");
    if (storedApiToken) {
      setApiToken(storedApiToken);
    }
    
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

    const storedTemplates = localStorage.getItem("mondaySavedTemplates");
    if (storedTemplates) {
      try {
        const parsedTemplates = JSON.parse(storedTemplates);
        if (Array.isArray(parsedTemplates)) {
          setSavedTemplates(parsedTemplates);
        } else {
          setSavedTemplates([]);
        }
      } catch (e) {
        console.error("Error parsing saved templates:", e);
        setSavedTemplates([]);
      }
    }
  }, []);

  const addTask = () => {
    const newId = tasks.length + 1;
    const formattedId = newId.toString().padStart(2, "0");
    
    const newTasks = [
      ...tasks,
      { id: formattedId, title: "", sourceBoard: "", destinationBoard: "" }
    ];
    
    setTasks(newTasks);
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

    if (currentTemplate && currentTemplate.name === saveTemplateName) {
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
    
    if (currentTemplate && currentTemplate.name === templateToDelete.name) {
      setCurrentTemplate(null);
      setSaveTemplateName("");
    }
    
    toast.success("Template deleted");
  };

  const value = {
    tasks,
    selectedTaskId,
    apiToken,
    currentTemplate,
    saveTemplateName,
    savedTemplates,
    setTasks,
    setSelectedTaskId,
    setApiToken,
    setCurrentTemplate,
    setSaveTemplateName,
    setSavedTemplates,
    addTask,
    updateTask,
    removeTask,
    selectTask,
    saveTasksAsTemplate,
    loadTemplate,
    deleteTemplate
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = (): TaskContextProps => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
