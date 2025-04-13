import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus, X as Multiply, Divide, Equal, CircleCheck, CircleX, ArrowRight } from "lucide-react";
import { CalculationToken } from "@/types/calculation";

interface FormulaBuilderProps {
  formula: CalculationToken[];
  onAddColumn: (column: any) => void;
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
  onRemoveToken: (index: number) => void;
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  formula,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
  onAddCondition,
  onAddLogical,
}) => {
  // Add state for formula mode (calculation or logic test)
  const [isLogicTestMode, setIsLogicTestMode] = useState(() => {
    // Initialize based on formula content - if it has if/then/else tokens, use logic test mode
    return formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value));
  });
  
  // Find positions of IF, THEN, and ELSE for dividing the formula
  const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
  const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
  const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
  
  // Divide formula into condition, then, and else parts
  const conditionPart = thenIndex > -1 ? formula.slice(0, thenIndex) : formula;
  const thenPart = elseIndex > -1 
    ? formula.slice(thenIndex + 1, elseIndex) 
    : (thenIndex > -1 ? formula.slice(thenIndex + 1) : []);
  const elsePart = elseIndex > -1 ? formula.slice(elseIndex + 1) : [];

  // Handle mode toggle
  const handleModeToggle = (checked: boolean) => {
    setIsLogicTestMode(checked);
    
    // If switching to calculation mode from logic mode, we need to clean up the formula
    if (!checked && ifIndex > -1) {
      // Remove IF, THEN, ELSE tokens and keep just the calculation part
      // This is a simplified approach - in a real app you'd want more sophisticated handling
      const calculationTokens = formula.filter(token => 
        token.type !== "logical" && 
        token.type !== "condition"
      );
      
      // Reset the formula
      const newFormula = [...calculationTokens];
      
      // We need to recreate the formula completely
      // This would ideally be handled by a function passed from parent
      // For now we'll just update the UI and let the parent handle this case separately
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">Formula Builder</h3>
        
        {/* Mode toggle switch */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Calculation</span>
          <Switch 
            checked={isLogicTestMode} 
            onCheckedChange={handleModeToggle}
            id="mode-toggle"
          />
          <span className="text-sm font-medium text-gray-700">Logic Test</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Condition part */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium mb-1 text-gray-600">
            {isLogicTestMode ? "IF condition" : "Formula"}
          </h4>
          <div className="p-4 border rounded-md bg-gray-50 min-h-16 flex flex-wrap gap-2 items-center">
            {isLogicTestMode && ifIndex > -1 && (
              <Badge 
                key="if-label"
                variant="default"
                className="px-3 py-1 bg-blue-500"
              >
                IF
              </Badge>
            )}
            {conditionPart.length > 0 ? (
              conditionPart.map((token, index) => (
                <Badge 
                  key={token.id}
                  variant={getBadgeVariant(token.type)}
                  className="px-3 py-1"
                  onClick={() => onRemoveToken(index)}
                >
                  {token.display}
                </Badge>
              ))
            ) : (
              <span className="text-gray-400">
                {isLogicTestMode ? "Build your condition here" : "Build your formula here"}
              </span>
            )}
          </div>
        </div>
        
        {/* Right side - divided into THEN and ELSE sections */}
        <div className="flex flex-col gap-3">
          {/* THEN part */}
          <div>
            <h4 className="text-sm font-medium mb-1 text-gray-600">
              THEN (if condition is TRUE)
            </h4>
            <div className={`p-4 border rounded-md ${isLogicTestMode ? "bg-green-50" : "bg-gray-100"} min-h-16 flex flex-wrap gap-2 items-center`}>
              {isLogicTestMode && thenIndex > -1 && (
                <Badge 
                  key="then-label"
                  variant="default"
                  className="px-3 py-1 bg-green-500"
                >
                  THEN
                </Badge>
              )}
              {thenPart.length > 0 ? (
                thenPart.map((token, index) => (
                  <Badge 
                    key={token.id}
                    variant={getBadgeVariant(token.type)}
                    className="px-3 py-1"
                    onClick={() => onRemoveToken(index + thenIndex + 1)}
                  >
                    {token.display}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400">
                  {isLogicTestMode ? "Add what should happen when condition is true" : "Not available in calculation mode"}
                </span>
              )}
            </div>
          </div>
          
          {/* ELSE part */}
          <div>
            <h4 className="text-sm font-medium mb-1 text-gray-600">
              ELSE (if condition is FALSE)
            </h4>
            <div className={`p-4 border rounded-md ${isLogicTestMode ? "bg-red-50" : "bg-gray-100"} min-h-16 flex flex-wrap gap-2 items-center`}>
              {isLogicTestMode && elseIndex > -1 && (
                <Badge 
                  key="else-label"
                  variant="default"
                  className="px-3 py-1 bg-red-500"
                >
                  ELSE
                </Badge>
              )}
              {elsePart.length > 0 ? (
                elsePart.map((token, index) => (
                  <Badge 
                    key={token.id}
                    variant={getBadgeVariant(token.type)}
                    className="px-3 py-1"
                    onClick={() => onRemoveToken(index + elseIndex + 1)}
                  >
                    {token.display}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400">
                  {isLogicTestMode ? "Add what should happen when condition is false" : "Not available in calculation mode"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Logic Operators - only visible in logic test mode */}
      {isLogicTestMode && (
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" className="bg-blue-50" onClick={() => onAddLogical("if")}>
            IF
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-50" onClick={() => onAddLogical("then")}>
            THEN
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-50" onClick={() => onAddLogical("else")}>
            ELSE
          </Button>
          <Button variant="outline" size="sm" className="bg-green-50" onClick={() => onAddLogical("true")}>
            <CircleCheck className="h-4 w-4 mr-1" />
            TRUE
          </Button>
          <Button variant="outline" size="sm" className="bg-red-50" onClick={() => onAddLogical("false")}>
            <CircleX className="h-4 w-4 mr-1" />
            FALSE
          </Button>
        </div>
      )}
      
      {/* Conditional Operators - only visible in logic test mode */}
      {isLogicTestMode && (
        <div className="flex flex-wrap gap-2 mt-2">
          <Button variant="outline" size="sm" className="bg-amber-50" onClick={() => onAddCondition("==")}>
            =
          </Button>
          <Button variant="outline" size="sm" className="bg-amber-50" onClick={() => onAddCondition("!=")}>
            ≠
          </Button>
          <Button variant="outline" size="sm" className="bg-amber-50" onClick={() => onAddCondition("<")}>
            &lt;
          </Button>
          <Button variant="outline" size="sm" className="bg-amber-50" onClick={() => onAddCondition(">")}>
            &gt;
          </Button>
          <Button variant="outline" size="sm" className="bg-amber-50" onClick={() => onAddCondition("<=")}>
            ≤
          </Button>
          <Button variant="outline" size="sm" className="bg-amber-50" onClick={() => onAddCondition(">=")}>
            ≥
          </Button>
        </div>
      )}
      
      {/* Math Operators - always visible */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={() => onAddOperator("+")}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAddOperator("-")}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAddOperator("*")}>
          <Multiply className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAddOperator("/")}>
          <Divide className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAddOperator("(")}>
          (
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAddOperator(")")}>
          )
        </Button>
        <Button variant="outline" size="sm" onClick={onAddNumber}>
          123
        </Button>
      </div>
      
      {/* Info panel with example - updated based on mode */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
        <p className="font-medium mb-1">Example:</p>
        {isLogicTestMode ? (
          <>
            <p>
              <strong>IF</strong> Column2 == 0 <strong>THEN</strong> Column2 + 1 <strong>ELSE</strong> Column2
            </p>
            <p className="mt-1">
              This will check if Column2 equals 0, and if true, store Column2 + 1 in the target column.
              If false, the original value in Column2 is stored.
            </p>
          </>
        ) : (
          <>
            <p>
              Column2 + Column3 * 2
            </p>
            <p className="mt-1">
              This will multiply Column3 by 2 and add it to Column2, storing the result in the target column.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to determine badge variant based on token type
const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'operator': return 'secondary';
    case 'number': return 'outline';
    case 'condition': return 'destructive'; 
    case 'logical': 
      return 'default';
    default: return 'default';
  }
};

export default FormulaBuilder;
