
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ActionButtonsProps {
  onBack: () => void;
  onApply: () => void;
  isFormValid: boolean;
  isEditing: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBack,
  onApply,
  isFormValid,
  isEditing
}) => {
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        Back to Board
      </Button>
      <Button 
        disabled={!isFormValid} 
        onClick={onApply}
        className="gap-2"
      >
        <ArrowRight className="h-4 w-4" /> 
        {isEditing ? "Update and Return" : "Apply and Return to Tasks"}
      </Button>
    </div>
  );
};

export default ActionButtons;
