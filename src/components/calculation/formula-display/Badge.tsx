
import React from "react";
import { Badge as UIBadge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";

interface TokenBadgeProps {
  token: CalculationToken & { uniqueId?: string };
  onRemove: () => void;
  disabled?: boolean;
}

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

export const TokenBadge: React.FC<TokenBadgeProps> = ({ token, onRemove, disabled = false }) => {
  return (
    <UIBadge 
      variant={getBadgeVariant(token.type)}
      className={`px-3 py-1 ${!disabled ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering container click
        if (!disabled) onRemove();
      }}
    >
      {token.display}
    </UIBadge>
  );
};
