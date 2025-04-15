
import React, { useEffect } from "react";
import { useCalculationBuilder } from "@/hooks/useCalculationBuilder";
import TaskSummary from "@/components/calculation/TaskSummary";
import CalculationForm from "@/components/calculation/CalculationForm";
import { useNavigate } from "react-router-dom";

const CalculationBuilder = () => {
  const {
    boardData,
    currentTask,
    selectedColumns,
    calculation,
    isLogicTestMode,
    handleBackToBoard,
    handleApplyFormula,
    handleProcessBoard,
    testCalculation
  } = useCalculationBuilder();
  const navigate = useNavigate();

  // Debugging and validation
  useEffect(() => {
    console.log("Current task in CalculationBuilder:", currentTask);
    console.log("Is logic test mode:", isLogicTestMode);
    console.log("Formula in state:", calculation.formula);
    
    // Validate task and board data, redirect to home if missing
    if (!currentTask) {
      console.warn("Missing task data in CalculationBuilder, redirecting to home");
      navigate("/");
    }
    
    if (!boardData) {
      console.warn("Missing board data in CalculationBuilder, redirecting to home");
      navigate("/");
    }
  }, [currentTask, isLogicTestMode, calculation.formula, boardData, navigate]);

  // Auto-save formula every 5 seconds if there are changes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentTask && calculation.formula.length > 0) {
        // This will trigger the auto-save in handleBackToBoard without navigation
        handleBackToBoard();
        console.log("Auto-saved operation formula");
      }
    }, 5000);
    
    return () => clearInterval(autoSaveInterval);
  }, [currentTask, calculation.formula]);

  if (!boardData || !currentTask) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading task data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">
        {isLogicTestMode 
          ? "Logic Test Operation" 
          : "Calculation Operation"}
      </h1>
      
      <TaskSummary task={currentTask} boardName={boardData.boardName} />
      
      <CalculationForm
        columns={selectedColumns}
        formula={calculation.formula}
        targetColumn={calculation.targetColumn}
        previewResult={calculation.previewResult}
        isCalculating={calculation.isCalculating}
        processedItems={calculation.processedItems}
        totalItems={calculation.totalItems}
        task={currentTask}
        isLogicTestMode={isLogicTestMode}
        onAddColumn={calculation.handleAddColumn}
        onAddOperator={calculation.handleAddOperator}
        onAddNumber={calculation.handleAddNumber}
        onRemoveToken={calculation.handleRemoveToken}
        onAddCondition={calculation.handleAddCondition}
        onAddLogical={calculation.handleAddLogical}
        onSetTarget={calculation.handleSetTarget}
        isFormulaValid={calculation.isFormulaValid}
        onBack={handleBackToBoard}
        onApply={handleApplyFormula}
        onTest={testCalculation}
        onProcessBoard={handleProcessBoard}
        onCancelProcessing={calculation.cancelProcessing}
      />
    </div>
  );
};

export default CalculationBuilder;
