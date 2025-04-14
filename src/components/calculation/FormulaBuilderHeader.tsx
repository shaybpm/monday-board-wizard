
import React from "react";

interface FormulaBuilderHeaderProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
}

const FormulaBuilderHeader: React.FC<FormulaBuilderHeaderProps> = ({
  isLogicTestMode,
  activeSection
}) => {
  // Get the appropriate color for the active section
  const getActiveSectionColor = () => {
    if (!isLogicTestMode) return "text-gray-800";
    
    switch (activeSection) {
      case "condition": return "text-blue-600";
      case "then": return "text-green-600";
      case "else": return "text-red-600";
      default: return "text-gray-800";
    }
  };

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
            <p>
              Active section: <span className={`font-bold ${getActiveSectionColor()}`}>
                {activeSection.toUpperCase()}
              </span>
            </p>
            <p className="mt-1">Click directly on any section below to make it active, then add elements to it.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default FormulaBuilderHeader;
