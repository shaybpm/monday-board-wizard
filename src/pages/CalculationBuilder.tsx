
import React from "react";
import { useCalculationBuilder } from "@/hooks/useCalculationBuilder";
import TaskSummary from "@/components/calculation/TaskSummary";
import CalculationForm from "@/components/calculation/CalculationForm";

const CalculationBuilder = () => {
  const {
    boardData,
    currentTask,
    selectedColumns,
    calculation,
    handleBackToBoard,
    handleApplyFormula,
    handleProcessBoard,
    testCalculation
  } = useCalculationBuilder();

  if (!boardData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">
        {currentTask?.savedOperations ? "Update Calculation" : "Task Setup - Operation"}
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
      />
    </div>
  );
};

export default CalculationBuilder;
