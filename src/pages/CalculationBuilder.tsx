import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoardData } from "@/hooks/useBoardData";
import { Task } from "@/types/task";
import { BoardColumn } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Plus, Minus, X as Multiply, Divide, Equal, ArrowRight, Parentheses } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Types for Calculation Building
interface CalculationToken {
  id: string;
  type: "column" | "operator" | "number";
  value: string;
  display: string;
}

const CalculationBuilder = () => {
  const { boardData } = useBoardData();
  const navigate = useNavigate();
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<BoardColumn[]>([]);
  const [formula, setFormula] = useState<CalculationToken[]>([]);
  const [targetColumn, setTargetColumn] = useState<BoardColumn | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  // Load current task info, selected columns, and any saved operations
  useEffect(() => {
    // Load task data
    const taskData = sessionStorage.getItem("mondayCurrentTask");
    if (taskData) {
      const parsedTask = JSON.parse(taskData);
      setCurrentTask(parsedTask);
      
      // If the task has saved operations, load them
      if (parsedTask.savedOperations) {
        setFormula(parsedTask.savedOperations.formula || []);
        
        // We'll set the target column when the board data is loaded
        if (parsedTask.savedOperations.targetColumn) {
          setTimeout(() => {
            setTargetColumn(parsedTask.savedOperations.targetColumn);
          }, 100);
        }
      }
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

  const handleAddOperator = (operator: string) => {
    const operatorMap: Record<string, string> = {
      "+": "plus",
      "-": "minus",
      "*": "multiply",
      "/": "divide",
      "(": "open parenthesis",
      ")": "close parenthesis"
    };
    
    setFormula([...formula, {
      id: `op-${Date.now()}`,
      type: "operator",
      value: operator,
      display: operator
    }]);
  };

  const handleAddNumber = () => {
    // Simple implementation - in a real app, would use a dialog
    const number = prompt("Enter a number:");
    if (number && !isNaN(Number(number))) {
      setFormula([...formula, {
        id: `num-${Date.now()}`,
        type: "number",
        value: number,
        display: number
      }]);
    }
  };

  const handleAddColumn = (column: BoardColumn) => {
    setFormula([...formula, {
      id: column.id,
      type: "column",
      value: column.id,
      display: column.title
    }]);
  };

  const handleSetTarget = (column: BoardColumn) => {
    setTargetColumn(column);
    calculatePreview();
  };

  const calculatePreview = () => {
    // This would be a simplified preview calculation
    // In a real implementation, we would fetch actual values and calculate the result
    setPreviewResult("42"); // Placeholder result
  };

  const handleRemoveToken = (index: number) => {
    const newFormula = [...formula];
    newFormula.splice(index, 1);
    setFormula(newFormula);
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

  const isFormulaValid = () => {
    return formula.length > 0 && targetColumn !== null;
  };

  if (!boardData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">
        {currentTask?.savedOperations ? "Update Calculation" : "Task Setup - Operation"}
      </h1>
      
      {currentTask && (
        <div className="bg-blue-50 p-3 rounded-md mb-4 text-blue-800 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="font-semibold">Task {currentTask.id}:</span>
            <span>{currentTask.title}</span>
            <span>-</span>
            <span>Source Board: {boardData.boardName} ({currentTask.sourceBoard})</span>
          </div>
        </div>
      )}

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
            <div>
              <h3 className="text-md font-medium mb-2">Available Columns</h3>
              <div className="flex flex-wrap gap-2">
                {selectedColumns.map(column => (
                  <Badge 
                    key={column.id}
                    variant="outline" 
                    className="px-3 py-1 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleAddColumn(column)}
                  >
                    {column.title}
                    <span className="ml-1 text-xs text-gray-500">({column.type})</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Formula Builder */}
            <div>
              <h3 className="text-md font-medium mb-2">Formula Builder</h3>
              <div className="p-4 border rounded-md bg-gray-50 min-h-16 flex flex-wrap gap-2 items-center">
                {formula.length > 0 ? (
                  formula.map((token, index) => (
                    <Badge 
                      key={token.id}
                      variant={token.type === 'operator' ? "secondary" : token.type === 'number' ? "outline" : "default"}
                      className="px-3 py-1"
                      onClick={() => handleRemoveToken(index)}
                    >
                      {token.display}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-400">Drag columns here or use operators below</span>
                )}
              </div>
              
              {/* Operators */}
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleAddOperator("+")}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddOperator("-")}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddOperator("*")}>
                  <Multiply className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddOperator("/")}>
                  <Divide className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddOperator("(")}>
                  (
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddOperator(")")}>
                  )
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddNumber}>
                  123
                </Button>
              </div>
            </div>

            {/* Target Column */}
            <div>
              <h3 className="text-md font-medium mb-2">Store Result In</h3>
              <div className="p-4 border rounded-md bg-gray-50 min-h-16 flex items-center">
                {targetColumn ? (
                  <Badge className="px-3 py-1">
                    {targetColumn.title}
                    <span className="ml-1 text-xs text-gray-500">({targetColumn.type})</span>
                  </Badge>
                ) : (
                  <span className="text-gray-400">Select a target column for the result</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {selectedColumns.map(column => (
                  <Button 
                    key={column.id} 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetTarget(column)}
                  >
                    {column.title}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview and Actions */}
            <div className="border-t pt-4 mt-4">
              {previewResult && (
                <div className="bg-green-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-green-800">Preview result: {previewResult}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBackToBoard}>
                  Back to Board
                </Button>
                <Button 
                  disabled={!isFormulaValid()} 
                  onClick={handleApplyFormula}
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4" /> 
                  {currentTask?.savedOperations ? "Update and Return" : "Apply and Return to Tasks"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculationBuilder;
