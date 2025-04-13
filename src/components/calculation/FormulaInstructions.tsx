
import React from "react";

interface FormulaInstructionsProps {
  isLogicTestMode: boolean;
}

const FormulaInstructions: React.FC<FormulaInstructionsProps> = ({
  isLogicTestMode
}) => {
  if (!isLogicTestMode) return null;
  
  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-sm text-yellow-700">
        <strong>Step-by-step:</strong> 
        <ol className="mt-1 list-decimal list-inside">
          <li>First add IF, THEN, and ELSE operators using the buttons below</li>
          <li>Click on a section to make it active (blue border)</li>
          <li>Add columns, numbers, and operators to the active section</li>
        </ol>
      </p>
    </div>
  );
};

export default FormulaInstructions;
