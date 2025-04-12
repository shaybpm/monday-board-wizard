
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X as Multiply, Divide, Equal, CircleCheck, CircleX } from "lucide-react";
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
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Formula Builder</h3>
      <div className="p-4 border rounded-md bg-gray-50 min-h-16 flex flex-wrap gap-2 items-center">
        {formula.length > 0 ? (
          formula.map((token, index) => (
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
          <span className="text-gray-400">Drag columns here or use operators below</span>
        )}
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

      {/* Logical Operators */}
      <div className="flex flex-wrap gap-2 mt-2">
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
    </div>
  );
};

// Helper function to determine badge variant based on token type
const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'operator': return 'secondary';
    case 'number': return 'outline';
    case 'condition': return 'destructive'; // Changed from 'warning' to 'destructive' as it's a supported variant
    case 'logical': 
      return 'default';
    default: return 'default';
  }
};

export default FormulaBuilder;
