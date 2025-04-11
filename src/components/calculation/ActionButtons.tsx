
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TestTube2 } from "lucide-react";

interface ActionButtonsProps {
  onBack: () => void;
  onApply: () => void;
  onTest?: () => void;
  isFormValid: boolean;
  isEditing: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBack,
  onApply,
  onTest,
  isFormValid,
  isEditing
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-between">
      <Button variant="outline" onClick={onBack}>
        Back to Board
      </Button>
      
      <div className="flex gap-3">
        {onTest && (
          <Button 
            variant="secondary"
            disabled={!isFormValid} 
            onClick={onTest}
            className="gap-2"
          >
            <TestTube2 className="h-4 w-4" /> 
            Test Task
          </Button>
        )}
        
        <Button 
          disabled={!isFormValid} 
          onClick={onApply}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" /> 
          {isEditing ? "Update and Return" : "Apply and Return to Tasks"}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
