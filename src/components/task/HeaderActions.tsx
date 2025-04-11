
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import TemplateLoadButton from "@/components/TemplateLoadButton";
import { useTaskContext } from "@/contexts/TaskContext";

interface HeaderActionsProps {
  onOpenApiDialog: () => void;
  onOpenSaveDialog: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ 
  onOpenApiDialog, 
  onOpenSaveDialog 
}) => {
  const { apiToken, savedTemplates, loadTemplate, currentTemplate } = useTaskContext();

  return (
    <div className="flex gap-2">
      <TemplateLoadButton 
        savedTemplates={savedTemplates || []}
        onLoadTemplate={loadTemplate}
      />
      <Button 
        variant="outline" 
        size="sm"
        onClick={onOpenSaveDialog}
        className="flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {currentTemplate ? "Save Template" : "Save As"}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onOpenApiDialog}
        className="flex items-center gap-2"
      >
        <span className="i-lucide-key text-gray-600 w-4 h-4" />
        {apiToken ? "API Token" : "Set API Token"}
      </Button>
    </div>
  );
};

export default HeaderActions;
