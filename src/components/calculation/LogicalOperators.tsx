
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX } from "lucide-react";

interface LogicalOperatorsProps {
  onAddCondition: (condition: string) => void;
  onAddLogical: (logical: string) => void;
}

const LogicalOperators: React.FC<LogicalOperatorsProps> = ({
  onAddCondition,
  onAddLogical,
}) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-blue-50 hover:bg-blue-100 active:scale-95 transition-colors"
          onClick={() => onAddLogical("if")}
        >
          IF
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-blue-50 hover:bg-blue-100 active:scale-95 transition-colors"
          onClick={() => onAddLogical("then")}
        >
          THEN
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-blue-50 hover:bg-blue-100 active:scale-95 transition-colors"
          onClick={() => onAddLogical("else")}
        >
          ELSE
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-green-50 hover:bg-green-100 active:scale-95 transition-colors"
          onClick={() => onAddLogical("true")}
        >
          <CircleCheck className="h-4 w-4 mr-1" />
          TRUE
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-red-50 hover:bg-red-100 active:scale-95 transition-colors"
          onClick={() => onAddLogical("false")}
        >
          <CircleX className="h-4 w-4 mr-1" />
          FALSE
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-amber-50 hover:bg-amber-100 active:scale-95 transition-colors"
          onClick={() => onAddCondition("==")}
        >
          =
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-amber-50 hover:bg-amber-100 active:scale-95 transition-colors"
          onClick={() => onAddCondition("!=")}
        >
          ≠
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-amber-50 hover:bg-amber-100 active:scale-95 transition-colors"
          onClick={() => onAddCondition("<")}
        >
          &lt;
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-amber-50 hover:bg-amber-100 active:scale-95 transition-colors"
          onClick={() => onAddCondition(">")}
        >
          &gt;
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-amber-50 hover:bg-amber-100 active:scale-95 transition-colors"
          onClick={() => onAddCondition("<=")}
        >
          ≤
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-amber-50 hover:bg-amber-100 active:scale-95 transition-colors"
          onClick={() => onAddCondition(">=")}
        >
          ≥
        </Button>
      </div>
    </>
  );
};

export default LogicalOperators;
