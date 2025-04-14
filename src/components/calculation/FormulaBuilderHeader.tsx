
import React from "react";

interface FormulaBuilderHeaderProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
}

const FormulaBuilderHeader: React.FC<FormulaBuilderHeaderProps> = ({
  isLogicTestMode,
  activeSection
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">
          {isLogicTestMode ? "Logic Test Builder" : "Formula Builder"}
        </h3>
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
