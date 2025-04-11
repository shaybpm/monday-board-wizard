
import { useState, useEffect } from "react";
import { SavedTaskTemplate, Task } from "@/types/task";
import { toast } from "sonner";

interface UseTemplateManagementProps {
  tasks: Task[];
  apiToken: string;
}

export function useTemplateManagement({ tasks, apiToken }: UseTemplateManagementProps) {
  // Always initialize with empty array
  const [savedTemplates, setSavedTemplates] = useState<SavedTaskTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<SavedTaskTemplate | null>(null);
  const [saveTemplateName, setSaveTemplateName] = useState("");

  // Ensure localStorage is initialized with an empty array if no templates exist
  useEffect(() => {
    try {
      // Set default empty templates in localStorage if it doesn't exist yet
      if (!localStorage.getItem("mondaySavedTemplates")) {
        localStorage.setItem("mondaySavedTemplates", JSON.stringify([]));
      }
      
      const storedTemplates = localStorage.getItem("mondaySavedTemplates");
      if (storedTemplates) {
        try {
          const parsedTemplates = JSON.parse(storedTemplates);
          // Always ensure it's an array
          setSavedTemplates(Array.isArray(parsedTemplates) ? parsedTemplates : []);
        } catch (e) {
          console.error("Error parsing saved templates:", e);
          // Reset to empty array on parse error
          setSavedTemplates([]);
          localStorage.setItem("mondaySavedTemplates", JSON.stringify([]));
        }
      } else {
        setSavedTemplates([]);
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      setSavedTemplates([]);
    }
  }, []);

  const saveTasksAsTemplate = () => {
    if (!saveTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      // Create a copy of the tasks to save - ensure it's an array
      const tasksToSave = Array.isArray(tasks) ? [...tasks] : [];
      
      // Ensure we have savedTemplates as an array
      const existingTemplates = Array.isArray(savedTemplates) ? savedTemplates : [];

      // Check if we're updating an existing template or creating a new one
      if (currentTemplate && currentTemplate.name === saveTemplateName) {
        // Update existing template
        const updatedTemplates = existingTemplates.map(template => 
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

        const updatedTemplates = [...existingTemplates, newTemplate];
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
    if (!template) {
      toast.error("Invalid template");
      return null;
    }
    
    try {
      // Ensure template.tasks is an array
      const templateTasks = Array.isArray(template.tasks) ? template.tasks : [];
      
      localStorage.setItem("mondayTasks", JSON.stringify(templateTasks));
      
      if (template.apiToken) {
        localStorage.setItem("mondayApiToken", template.apiToken);
      }
      
      setCurrentTemplate(template);
      setSaveTemplateName(template.name || "");
      toast.success(`Template "${template.name}" loaded successfully`);
      
      return { 
        tasks: templateTasks,
        apiToken: template.apiToken || "" 
      };
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template");
      return null;
    }
  };

  const deleteTemplate = (index: number) => {
    try {
      // Ensure savedTemplates is an array
      const templatesArray = Array.isArray(savedTemplates) ? savedTemplates : [];
      
      if (index >= 0 && index < templatesArray.length) {
        const templateToDelete = templatesArray[index];
        const updatedTemplates = templatesArray.filter((_, i) => i !== index);
        setSavedTemplates(updatedTemplates);
        localStorage.setItem("mondaySavedTemplates", JSON.stringify(updatedTemplates));
        
        // Reset current template if it was the deleted one
        if (currentTemplate && templateToDelete && currentTemplate.name === templateToDelete.name) {
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
    // Always return an array for savedTemplates, never undefined
    savedTemplates: Array.isArray(savedTemplates) ? savedTemplates : [],
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
