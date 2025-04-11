
import React, { createContext, useContext, ReactNode } from "react";
import { SavedTaskTemplate } from "@/types/task";
import { TaskContextProps } from "./task/types";
import { useTaskManagement } from "./task/useTaskManagement";
import { useApiToken } from "./task/useApiToken";
import { useTemplateManagement } from "./task/useTemplateManagement";

// Create the context with a default value to prevent undefined issues
const TaskContext = createContext<TaskContextProps>({
  tasks: [],
  selectedTaskId: null,
  apiToken: "",
  currentTemplate: null,
  saveTemplateName: "",
  savedTemplates: [], // Ensure this has a default empty array
  setTasks: () => {},
  setSelectedTaskId: () => {},
  setApiToken: () => {},
  setCurrentTemplate: () => {},
  setSaveTemplateName: () => {},
  setSavedTemplates: () => {},
  addTask: () => {},
  updateTask: () => {},
  removeTask: () => {},
  selectTask: () => {},
  saveTasksAsTemplate: () => {},
  loadTemplate: () => null,
  deleteTemplate: () => {},
});

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    tasks, 
    setTasks, 
    selectedTaskId, 
    setSelectedTaskId, 
    addTask, 
    updateTask, 
    removeTask, 
    selectTask 
  } = useTaskManagement();
  
  const { apiToken, setApiToken } = useApiToken();
  
  const { 
    savedTemplates,
    setSavedTemplates,
    currentTemplate,
    setCurrentTemplate,
    saveTemplateName,
    setSaveTemplateName,
    saveTasksAsTemplate,
    loadTemplate: loadTemplateInternal,
    deleteTemplate
  } = useTemplateManagement({ tasks, apiToken });

  // Wrap the load template function to update our local state
  const loadTemplate = (template: SavedTaskTemplate) => {
    if (!template) return null;
    
    const result = loadTemplateInternal(template);
    if (result) {
      setTasks(result.tasks);
      setApiToken(result.apiToken || "");
    }
    return result;
  };

  const value: TaskContextProps = {
    tasks,
    selectedTaskId,
    apiToken,
    currentTemplate,
    saveTemplateName,
    // Ensure savedTemplates is always an array with a fallback
    savedTemplates: Array.isArray(savedTemplates) ? savedTemplates : [],
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
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
