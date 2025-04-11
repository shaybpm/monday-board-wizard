
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBoardData } from "@/hooks/useBoardData";
import { Task } from "@/types/task";
import { BoardColumn } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { toast } from "sonner";

// Import our components
import ColumnsSelector from "@/components/calculation/ColumnsSelector";
import FormulaBuilder from "@/components/calculation/FormulaBuilder";
import TargetColumnSelector from "@/components/calculation/TargetColumnSelector";
import TaskSummary from "@/components/calculation/TaskSummary";
import ActionButtons from "@/components/calculation/ActionButtons";
import { useCalculation } from "@/hooks/useCalculation";

const CalculationBuilder = () => {
  const { boardData } = useBoardData();
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<BoardColumn[]>([]);
  
  // Use our custom hook for calculation logic
  const {
    formula,
    targetColumn,
    previewResult,
    isCalculating,
    handleAddOperator,
    handleAddNumber,
    handleAddColumn,
    handleSetTarget,
    handleRemoveToken,
    isFormulaValid,
    testCalculation
  } = useCalculation(currentTask);

  // Load current task info, selected columns, and any saved operations
  useEffect(() => {
    // Load task data
    const taskData = sessionStorage.getItem("mondayCurrentTask");
    if (taskData) {
      const parsedTask = JSON.parse(taskData);
      setCurrentTask(parsedTask);
    }

    // Load selected columns
    const columnsData = sessionStorage.getItem("selectedColumns");
    if (columnsData && boardData) {
      try {
        const columnIds = JSON.parse(columnsData);
        // If we have column IDs, use them, otherwise if a task has saved operations, use all columns
        if (Array.isArray(columnIds) && columnIds.length > 0) {
          const columns = boardData.columns.filter(col => columnIds.includes(col.id));
          setSelectedColumns(columns);
        } else if (boardData.columns && taskData) {
          // If no columns are selected but we're editing an existing operation, make all columns available
          const parsedTask = JSON.parse(taskData);
          if (parsedTask.savedOperations) {
            setSelectedColumns(boardData.columns);
          }
        }
      } catch (error) {
        console.error("Error parsing columns data:", error);
      }
    } else if (boardData && boardData.columns) {
      // If no columns are stored and we have a task with saved operations, make all columns available
      const taskData = sessionStorage.getItem("mondayCurrentTask");
      if (taskData) {
        try {
          const parsedTask = JSON.parse(taskData);
          if (parsedTask.savedOperations) {
            setSelectedColumns(boardData.columns);
          }
        } catch (error) {
          console.error("Error parsing task data:", error);
        }
      }
    }
  }, [boardData]);

  const handleBackToBoard = () => {
    navigate("/board");
  };

  const handleApplyFormula = () => {
    // Save the operation to the task
    if (currentTask) {
      // Load all tasks
      const tasksData = localStorage.getItem("mondayTasks");
      if (tasksData) {
        try {
          const tasks = JSON.parse(tasksData);
          // Find the current task
          const updatedTasks = tasks.map((task: Task) => {
            if (task.id === currentTask.id) {
              // Save the formula and target column
              return {
                ...task,
                savedOperations: {
                  formula: formula,
                  targetColumn: targetColumn
                }
              };
            }
            return task;
          });
          
          // Save updated tasks to localStorage
          localStorage.setItem("mondayTasks", JSON.stringify(updatedTasks));
          toast.success("Formula saved and applied successfully!");
          
          // Navigate to the landing page
          navigate("/");
        } catch (error) {
          console.error("Error saving operation:", error);
          toast.error("Failed to save operation");
        }
      }
    } else {
      toast.success("Formula applied successfully!");
      navigate("/");
    }
  };

  if (!boardData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">
        {currentTask?.savedOperations ? "Update Calculation" : "Task Setup - Operation"}
      </h1>
      
      <TaskSummary task={currentTask} boardName={boardData.boardName} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {currentTask?.savedOperations ? "Update Your Calculation" : "Build Your Calculation"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Column Tokens */}
            <ColumnsSelector 
              columns={selectedColumns} 
              onSelectColumn={handleAddColumn} 
            />

            {/* Formula Builder */}
            <FormulaBuilder
              formula={formula}
              onAddColumn={handleAddColumn}
              onAddOperator={handleAddOperator}
              onAddNumber={handleAddNumber}
              onRemoveToken={handleRemoveToken}
            />

            {/* Target Column */}
            <TargetColumnSelector
              columns={selectedColumns}
              targetColumn={targetColumn}
              onSelectTarget={handleSetTarget}
            />

            {/* Preview and Actions */}
            <div className="border-t pt-4 mt-4">
              {previewResult && (
                <div className="bg-green-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-green-800">Preview result: {previewResult}</p>
                </div>
              )}
              
              {isCalculating && (
                <div className="flex justify-center my-4">
                  <div className="animate-pulse text-blue-500">Testing calculation...</div>
                </div>
              )}
              
              <ActionButtons
                onBack={handleBackToBoard}
                onApply={handleApplyFormula}
                onTest={testCalculation}
                isFormValid={isFormulaValid()}
                isEditing={!!currentTask?.savedOperations}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculationBuilder;
