
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
      <div className="text-sm text-yellow-700">
        <strong>Step-by-step:</strong> 
        <ol className="mt-1 list-decimal list-inside">
          <li>First add IF, THEN, and ELSE operators using the buttons below</li>
          <li>Click on a section to make it active (blue border)</li>
          <li>Add columns, comparison operators (&lt;, =, etc.), and click the <span className="bg-purple-100 px-1 py-0.5 rounded">123</span> button to enter a number</li>
        </ol>
        <div className="mt-2 text-xs">
          <strong>Number button:</strong> 
          <ul className="mt-1 list-disc list-inside">
            <li>Click the pulsing <span className="bg-purple-100 px-1 py-0.5 rounded">123</span> button</li>
            <li>Type your number in the prompt and press OK</li>
            <li>The number will appear in the active section</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormulaInstructions;
