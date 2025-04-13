
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
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddOperator("+")}
        className="hover:bg-blue-50 transition-colors active:scale-95"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddOperator("-")}
        className="hover:bg-blue-50 transition-colors active:scale-95"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddOperator("*")}
        className="hover:bg-blue-50 transition-colors active:scale-95"
      >
        <Multiply className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddOperator("/")}
        className="hover:bg-blue-50 transition-colors active:scale-95"
      >
        <Divide className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddOperator("(")}
        className="hover:bg-blue-50 transition-colors active:scale-95"
      >
        (
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onAddOperator(")")}
        className="hover:bg-blue-50 transition-colors active:scale-95"
      >
        )
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddNumber}
        className="bg-purple-50 hover:bg-purple-100 transition-colors active:scale-95 font-medium"
      >
        123
      </Button>
    </div>
  );
};

export default FormulaOperators;
