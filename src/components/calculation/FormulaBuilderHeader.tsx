
import React from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface FormulaBuilderHeaderProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  onModeToggle: (checked: boolean) => void;
}

const FormulaBuilderHeader: React.FC<FormulaBuilderHeaderProps> = ({
  isLogicTestMode,
  activeSection,
  onModeToggle
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">Formula Builder</h3>
        
        {/* Mode toggle switch */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Calculation</span>
          <Switch 
            checked={isLogicTestMode} 
            onCheckedChange={onModeToggle}
            id="mode-toggle"
          />
          <span className="text-sm font-medium text-gray-700">Logic Test</span>
        </div>
      </div>
      
      {isLogicTestMode && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <div className="text-sm text-blue-600 font-medium">
            <p>Active section: <span className="font-bold">{activeSection.toUpperCase()}</span></p>
            <p className="mt-1">Click on any section below to make it active, then add elements to it.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default FormulaBuilderHeader;
