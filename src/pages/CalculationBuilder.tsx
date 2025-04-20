
import React, { useEffect } from "react";
import { useCalculationBuilder } from "@/hooks/useCalculationBuilder";
import TaskSummary from "@/components/calculation/TaskSummary";
import CalculationForm from "@/components/calculation/CalculationForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CalculationBuilder = () => {
  const {
    boardData,
    currentTask,
    selectedColumns,
    calculation,
    isLogicTestMode,
    loadingTask,
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
    console.log("Is loading task:", loadingTask);
    
    // Validate task and board data, redirect to home if missing
    if (!currentTask && !loadingTask) {
      console.error("Missing task data in CalculationBuilder, redirecting to home");
      toast.error("No active task found. Please select a task first.");
      
      // Try to recover task from localStorage if possible
      const selectedTaskId = localStorage.getItem("mondaySelectedTaskId");
      const tasksData = localStorage.getItem("mondayTasks");
      
      if (selectedTaskId && tasksData) {
        try {
          const tasks = JSON.parse(tasksData);
          const task = tasks.find((t: any) => t.id === selectedTaskId);
          
          if (task) {
            console.log("Recovered task from localStorage:", task);
            sessionStorage.setItem("mondayCurrentTask", JSON.stringify(task));
            // Now reload the page to use the recovered task
            window.location.reload();
            return;
          }
        } catch (error) {
          console.error("Error recovering task:", error);
        }
      }
      
      // Small delay to allow the toast to be displayed
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
      return;
    }
    
    if (!boardData && !loadingTask) {
      console.error("Missing board data in CalculationBuilder, redirecting to home");
      toast.error("Missing board data. Please reconnect to Monday.com.");
      
      // Small delay to allow the toast to be displayed
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
      return;
    }
    
    // Log full task details for debugging
    if (currentTask) {
      console.log("Full task details:", {
        id: currentTask.id,
        title: currentTask.title,
        sourceBoard: currentTask.sourceBoard,
        taskType: currentTask.taskType,
        boardConfigured: currentTask.boardConfigured,
        hasOperations: !!currentTask.savedOperations
      });
    }
  }, [currentTask, isLogicTestMode, calculation.formula, boardData, navigate, loadingTask]);

  // Remove the auto-save effect since it's now handled in the useAutoSave hook
  
  // Return a loading state while checking validation
  if (loadingTask || !boardData || !currentTask) {
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
