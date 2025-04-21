
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import { BoardColumn } from "@/lib/types";
import { CalculationToken } from "@/types/calculation";
import { Task } from "@/types/task";

// Import our components
import ColumnsSelector from "@/components/calculation/ColumnsSelector";
import FormulaBuilder from "@/components/calculation/FormulaBuilder";
import TargetColumnSelector from "@/components/calculation/TargetColumnSelector";
import ActionButtons from "@/components/calculation/ActionButtons";

interface CalculationFormProps {
  columns: BoardColumn[];
  formula: CalculationToken[];
  targetColumn: BoardColumn | null;
  previewResult: string | null;
  isCalculating: boolean;
  processedItems: number;
  totalItems: number;
  task: Task | null;
  isLogicTestMode: boolean;
  onAddColumn: (column: BoardColumn) => void;
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
  onRemoveToken: (index: number) => void;
  onSetTarget: (column: BoardColumn) => void;
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
  isFormulaValid: () => boolean;
  onBack: () => void;
  onApply: () => void;
  onTest: () => void;
  onProcessBoard: () => void;
  onCancelProcessing?: () => void;
}

const CalculationForm: React.FC<CalculationFormProps> = ({
  columns,
  formula,
  targetColumn,
  previewResult,
  isCalculating,
  processedItems,
  totalItems,
  task,
  isLogicTestMode,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
  onSetTarget,
  onAddCondition,
  onAddLogical,
  isFormulaValid,
  onBack,
  onApply,
  onTest,
  onProcessBoard,
  onCancelProcessing
}) => {
  // Log for debugging
  console.log("CalculationForm - Is logic test mode:", isLogicTestMode);
  console.log("CalculationForm - Task:", task);
  
  // Get debug info from sessionStorage
  const debugInfo = sessionStorage.getItem("calculationDebugInfo");
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {task?.savedOperations ? "Update Your Calculation" : "Build Your Calculation"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Column Tokens */}
          <ColumnsSelector 
            columns={columns} 
            onSelectColumn={onAddColumn} 
          />

          {/* Formula Builder - with divided sections for condition and action */}
          <FormulaBuilder
            formula={formula}
            onAddColumn={onAddColumn}
            onAddOperator={onAddOperator}
            onAddNumber={onAddNumber}
            onRemoveToken={onRemoveToken}
            onAddCondition={onAddCondition}
            onAddLogical={onAddLogical}
            isLogicTestMode={isLogicTestMode}
          />

          {/* Target Column */}
          <TargetColumnSelector
            columns={columns}
            targetColumn={targetColumn}
            onSelectTarget={onSetTarget}
          />

          {/* Preview and Actions */}
          <div className="border-t pt-4 mt-4">
            {previewResult && (
              <div className="bg-green-50 p-3 rounded-md mb-4">
                <p className="text-sm text-green-800">
                  Preview result: {previewResult === 'true' ? 'TRUE' : 
                                  previewResult === 'false' ? 'FALSE' : 
                                  previewResult}
                </p>
              </div>
            )}
            
            {debugInfo && (
              <div className="bg-blue-50 p-3 rounded-md mb-4 whitespace-pre-wrap">
                <p className="text-sm font-medium text-blue-800 mb-1">Debug Information:</p>
                <p className="text-xs text-blue-700 font-mono">{debugInfo}</p>
              </div>
            )}
            
            {isCalculating && !processedItems && (
              <div className="flex justify-center my-4">
                <div className="animate-pulse text-blue-500">Testing calculation...</div>
              </div>
            )}
            
            <ActionButtons
              onBack={onBack}
              onApply={onApply}
              onTest={onTest}
              onProcessBoard={onProcessBoard}
              onCancelProcess={onCancelProcessing}
              isFormValid={isFormulaValid()}
              isEditing={!!task?.savedOperations}
              isCalculating={isCalculating}
              processProgress={
                totalItems > 0 ? { current: processedItems, total: totalItems } : undefined
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationForm;
