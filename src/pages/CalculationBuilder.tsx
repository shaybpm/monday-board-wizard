
import React, { useEffect } from "react";
import { useCalculationBuilder } from "@/hooks/useCalculationBuilder";
import TaskSummary from "@/components/calculation/TaskSummary";
import CalculationForm from "@/components/calculation/CalculationForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    console.log("Current task in CalculationBuilder:", currentTask);
    console.log("Is logic test mode:", isLogicTestMode);
    console.log("Formula in state:", calculation.formula);
    console.log("Is loading task:", loadingTask);
    console.log("Board data available:", !!boardData);
    console.log("Selected columns:", selectedColumns);
    
    if (!currentTask && !loadingTask) {
      console.error("Missing task data in CalculationBuilder, redirecting to home");
      toast.error("No active task found. Please select a task first.");
      
      const selectedTaskId = localStorage.getItem("mondaySelectedTaskId");
      const tasksData = localStorage.getItem("mondayTasks");
      
      if (selectedTaskId && tasksData) {
        try {
          const tasks = JSON.parse(tasksData);
          const task = tasks.find((t: any) => t.id === selectedTaskId);
          
          if (task) {
            console.log("Recovered task from localStorage:", task);
            sessionStorage.setItem("mondayCurrentTask", JSON.stringify(task));
            window.location.reload();
            return;
          }
        } catch (error) {
          console.error("Error recovering task:", error);
        }
      }
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
      return;
    }
  }, [currentTask, isLogicTestMode, calculation.formula, boardData, navigate, loadingTask, selectedColumns]);

  if (loadingTask || !currentTask) {
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
  
  if (!boardData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Missing board data</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Unable to load board data. Please reconnect to Monday.com.</p>
                  </div>
                  <div className="mt-4">
                    <Button 
                      type="button" 
                      onClick={() => navigate("/")} 
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have properly resolved the selected columns
  const columnsToDisplay = selectedColumns && selectedColumns.length > 0 
    ? selectedColumns.map((colId: string) => {
      const foundColumn = boardData.columns.find(col => col.id === colId);
      return foundColumn || null;
    }).filter(Boolean)
    : [];

  console.log("Columns to display in calculation form:", columnsToDisplay);

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">
        {isLogicTestMode 
          ? "Logic Test Operation" 
          : "Calculation Operation"}
      </h1>
      
      <TaskSummary task={currentTask} boardName={boardData.boardName} />
      
      <CalculationForm
        columns={columnsToDisplay}
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
        onProcessBoard={() => handleProcessBoard(boardData)}
        onCancelProcessing={calculation.cancelProcessing}
      />
    </div>
  );
};

export default CalculationBuilder;
