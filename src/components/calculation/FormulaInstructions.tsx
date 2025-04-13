
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
          <strong>Tips:</strong> 
          <ul className="mt-1 list-disc list-inside">
            <li>When adding a number, click the <span className="bg-purple-100 px-1 py-0.5 rounded">123</span> button, type your number in the popup, and click OK. <strong>If prompted twice, something went wrong - please report it.</strong></li>
            <li>If you can't add operators or numbers, check which section is active.</li>
            <li>Make sure you've added the IF, THEN, or ELSE operator for that section first.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormulaInstructions;
