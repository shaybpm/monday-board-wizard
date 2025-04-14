
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
  disabled?: boolean;
  onClick?: () => void; // Add click handler for the container
}

const FormulaTokensDisplay: React.FC<FormulaTokensDisplayProps> = ({
  tokens,
  label,
  emptyMessage,
  badgePrefix,
  className = "bg-gray-50",
  onRemoveToken,
  startIndex = 0,
  disabled = false,
  onClick, // Use the click handler
}) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-1 text-gray-600">{label}</h4>
      <div 
        className={`p-4 border rounded-md ${className} min-h-16 flex flex-wrap gap-2 items-center 
          ${disabled ? 'opacity-60' : ''} 
          ${onClick && !disabled ? 'cursor-pointer hover:bg-opacity-90 transition-all' : ''}
          ${onClick && !disabled && tokens.length === 0 ? 'animate-pulse' : ''}
        `}
        aria-disabled={disabled}
        onClick={() => onClick && !disabled && onClick()} // Add click handler
        role={onClick && !disabled ? "button" : undefined}
      >
        {badgePrefix}
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <Badge 
              key={token.id || index}
              variant={getBadgeVariant(token.type)}
              className={`px-3 py-1 ${!disabled ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering container click
                if (!disabled) onRemoveToken(index);
              }}
            >
              {token.display}
            </Badge>
          ))
        ) : (
          <span className={`text-gray-400 ${onClick && !disabled ? 'pointer-events-none' : ''}`}>{emptyMessage}</span>
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
