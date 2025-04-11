
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TestTube2, Calculator } from "lucide-react";

interface ActionButtonsProps {
  onBack: () => void;
  onApply: () => void;
  onTest?: () => void;
  onProcessBoard?: () => void;
  isFormValid: boolean;
  isEditing: boolean;
  isCalculating: boolean;
  processProgress?: {
    current: number;
    total: number;
  };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onBack,
  onApply,
  onTest,
  onProcessBoard,
  isFormValid,
  isEditing,
  isCalculating,
  processProgress
}) => {
  const showProgress = isCalculating && processProgress && processProgress.total > 0;
  const progressPercent = showProgress 
    ? Math.round((processProgress.current / processProgress.total) * 100)
    : 0;

  return (
    <div className="flex flex-wrap gap-3 justify-between">
      <Button variant="outline" onClick={onBack}>
        Back to Board
      </Button>
      
      <div className="flex gap-3">
        {onTest && (
          <Button 
            variant="secondary"
            disabled={!isFormValid || isCalculating} 
            onClick={onTest}
            className="gap-2"
          >
            <TestTube2 className="h-4 w-4" /> 
            Test Task
          </Button>
        )}
        
        {onProcessBoard && (
          <Button 
            variant="outline"
            disabled={!isFormValid || isCalculating}
            onClick={onProcessBoard}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            {showProgress ? `Processing... ${progressPercent}%` : "Process Board"}
          </Button>
        )}
        
        <Button 
          disabled={!isFormValid || isCalculating} 
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
