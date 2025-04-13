
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, X as Multiply, Divide, Calculator } from "lucide-react";

interface FormulaOperatorsProps {
  onAddOperator: (operator: string) => void;
  onAddNumber: () => void;
}

const FormulaOperators: React.FC<FormulaOperatorsProps> = ({
  onAddOperator,
  onAddNumber,
}) => {
  const handleNumberButtonClick = (e: React.MouseEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault(); 
    e.stopPropagation();
    
    console.log("[Number Button] Number button clicked - starting number input");
    
    // Call the handler directly - no debouncing needed as we handle that in the hook
    onAddNumber();
  };
  
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
        variant="secondary" 
        size="sm" 
        onClick={handleNumberButtonClick}
        className="bg-purple-100 hover:bg-purple-200 transition-colors active:scale-95 font-medium relative"
        // Add a pulsing animation to highlight this button
        style={{
          animation: "pulse 2s infinite",
        }}
      >
        <Calculator className="h-4 w-4 mr-1" /> 123
      </Button>
      
      <style>
        {`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(147, 51, 234, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
          }
        }
      `}
      </style>
    </div>
  );
};

export default FormulaOperators;
