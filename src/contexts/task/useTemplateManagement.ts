
import { useState, useEffect } from "react";
import { SavedTaskTemplate, Task } from "@/types/task";
import { toast } from "sonner";

interface UseTemplateManagementProps {
  tasks: Task[];
  apiToken: string;
}

export function useTemplateManagement({ tasks, apiToken }: UseTemplateManagementProps) {
  const [savedTemplates, setSavedTemplates] = useState<SavedTaskTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<SavedTaskTemplate | null>(null);
  const [saveTemplateName, setSaveTemplateName] = useState("");

  // Load saved templates from localStorage on mount
  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem("mondaySavedTemplates");
      if (storedTemplates) {
        const parsedTemplates = JSON.parse(storedTemplates);
        if (Array.isArray(parsedTemplates)) {
          setSavedTemplates(parsedTemplates);
        } else {
          console.warn("Stored templates is not an array, resetting to empty array");
          setSavedTemplates([]);
          localStorage.setItem("mondaySavedTemplates", JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error("Error parsing saved templates:", e);
      setSavedTemplates([]);
      localStorage.setItem("mondaySavedTemplates", JSON.stringify([]));
    }
  }, []);

  const saveTasksAsTemplate = () => {
    if (!saveTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      // Create a copy of the tasks to save
      const tasksToSave = [...tasks];

      // Check if we're updating an existing template or creating a new one
      if (currentTemplate && currentTemplate.name === saveTemplateName) {
        // Update existing template
        const updatedTemplates = savedTemplates.map(template => 
          template.name === saveTemplateName 
            ? {
                ...template,
                tasks: tasksToSave,
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
          tasks: tasksToSave,
          apiToken: apiToken,
          dateCreated: new Date().toISOString()
        };

        const updatedTemplates = [...(savedTemplates || []), newTemplate];
        setSavedTemplates(updatedTemplates);
        setCurrentTemplate(newTemplate);
        localStorage.setItem("mondaySavedTemplates", JSON.stringify(updatedTemplates));
        toast.success(`Template "${saveTemplateName}" saved successfully`);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const loadTemplate = (template: SavedTaskTemplate) => {
    try {
      if (template && Array.isArray(template.tasks) && template.tasks.length > 0) {
        localStorage.setItem("mondayTasks", JSON.stringify(template.tasks));
        
        if (template.apiToken) {
          localStorage.setItem("mondayApiToken", template.apiToken);
        }
        
        setCurrentTemplate(template);
        setSaveTemplateName(template.name || "");
        toast.success(`Template "${template.name}" loaded successfully`);
        
        return { tasks: template.tasks, apiToken: template.apiToken || "" };
      } else {
        toast.error("Invalid template or no tasks in template");
        return null;
      }
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template");
      return null;
    }
  };

  const deleteTemplate = (index: number) => {
    try {
      if (index >= 0 && index < (savedTemplates || []).length) {
        const templateToDelete = savedTemplates[index];
        const updatedTemplates = savedTemplates.filter((_, i) => i !== index);
        setSavedTemplates(updatedTemplates);
        localStorage.setItem("mondaySavedTemplates", JSON.stringify(updatedTemplates));
        
        if (currentTemplate && currentTemplate.name === templateToDelete.name) {
          setCurrentTemplate(null);
          setSaveTemplateName("");
        }
        
        toast.success("Template deleted successfully");
      } else {
        toast.error("Invalid template index");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  return {
    savedTemplates,
    setSavedTemplates,
    currentTemplate,
    setCurrentTemplate,
    saveTemplateName,
    setSaveTemplateName,
    saveTasksAsTemplate,
    loadTemplate,
    deleteTemplate
  };
}
