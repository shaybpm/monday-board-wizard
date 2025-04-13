
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X as Multiply, Divide } from "lucide-react";

interface FormulaOperatorsProps {
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
}

const FormulaOperators: React.FC<FormulaOperatorsProps> = ({
  onAddOperator,
  onAddNumber,
}) => {
  return (
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
  );
};

export default FormulaOperators;
