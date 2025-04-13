
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";

interface FormulaTokensDisplayProps {
  tokens: CalculationToken[];
  label: string;
  emptyMessage: string;
  badgePrefix?: React.ReactNode;
  className?: string;
  onRemoveToken: (index: number) => void;
  startIndex?: number;
}

const FormulaTokensDisplay: React.FC<FormulaTokensDisplayProps> = ({
  tokens,
  label,
  emptyMessage,
  badgePrefix,
  className = "bg-gray-50",
  onRemoveToken,
  startIndex = 0,
}) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-1 text-gray-600">{label}</h4>
      <div className={`p-4 border rounded-md ${className} min-h-16 flex flex-wrap gap-2 items-center`}>
        {badgePrefix}
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <Badge 
              key={token.id}
              variant={getBadgeVariant(token.type)}
              className="px-3 py-1"
              onClick={() => onRemoveToken(index + startIndex)}
            >
              {token.display}
            </Badge>
          ))
        ) : (
          <span className="text-gray-400">{emptyMessage}</span>
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

export default FormulaTokensDisplay;
