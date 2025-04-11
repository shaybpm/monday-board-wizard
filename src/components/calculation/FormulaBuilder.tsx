
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X as Multiply, Divide } from "lucide-react";
import { CalculationToken } from "@/types/calculation";

interface FormulaBuilderProps {
  formula: CalculationToken[];
  onAddColumn: (column: any) => void;
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
  onRemoveToken: (index: number) => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({
  formula,
  onAddColumn,
  onAddOperator,
  onAddNumber,
  onRemoveToken,
}) => {
  return (
    <div>
      <h3 className="text-md font-medium mb-2">Formula Builder</h3>
      <div className="p-4 border rounded-md bg-gray-50 min-h-16 flex flex-wrap gap-2 items-center">
        {formula.length > 0 ? (
          formula.map((token, index) => (
            <Badge 
              key={token.id}
              variant={token.type === 'operator' ? "secondary" : token.type === 'number' ? "outline" : "default"}
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
      <div className="flex gap-2 mt-2">
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
    </div>
  );
};

export default FormulaBuilder;
