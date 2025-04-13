
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div>
      <h3 className="text-md font-medium mb-2">Formula Builder</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - Condition part */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium mb-1 text-gray-600">
            {ifIndex > -1 ? "IF condition" : "Formula / Condition"}
          </h4>
          <div className="p-4 border rounded-md bg-gray-50 min-h-16 flex flex-wrap gap-2 items-center">
            {ifIndex > -1 && (
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
              <span className="text-gray-400">Build your condition here</span>
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
            <div className="p-4 border rounded-md bg-green-50 min-h-16 flex flex-wrap gap-2 items-center">
              {thenIndex > -1 && (
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
                  Add what should happen when condition is true
                </span>
              )}
            </div>
          </div>
          
          {/* ELSE part */}
          <div>
            <h4 className="text-sm font-medium mb-1 text-gray-600">
              ELSE (if condition is FALSE)
            </h4>
            <div className="p-4 border rounded-md bg-red-50 min-h-16 flex flex-wrap gap-2 items-center">
              {elseIndex > -1 && (
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
                  Add what should happen when condition is false
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Logic Operators */}
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
      
      {/* Conditional Operators */}
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
      
      {/* Operators */}
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
      
      {/* Info panel with example */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
        <p className="font-medium mb-1">Example:</p>
        <p>
          <strong>IF</strong> Column2 == 0 <strong>THEN</strong> Column2 + 1 <strong>ELSE</strong> Column2
        </p>
        <p className="mt-1">
          This will check if Column2 equals 0, and if true, store Column2 + 1 in the target column.
          If false, the original value in Column2 is stored.
        </p>
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
