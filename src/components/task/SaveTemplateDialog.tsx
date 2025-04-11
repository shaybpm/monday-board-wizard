
import React from "react";
import { Button } from "@/components/ui/button";
import { SaveAll } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({ isOpen, onClose }) => {
  const { 
    currentTemplate, 
    saveTemplateName,
    setSaveTemplateName,
    saveTasksAsTemplate,
    setCurrentTemplate
  } = useTaskContext();

  if (!isOpen) return null;

  return (
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
            onClick={onClose}
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
            onClick={() => {
              saveTasksAsTemplate();
              onClose();
            }}
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
  );
};

export default SaveTemplateDialog;
