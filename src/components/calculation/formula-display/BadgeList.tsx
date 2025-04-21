
import React from "react";
import { CalculationToken } from "@/types/calculation";
import { TokenBadge } from "./Badge";

interface BadgeListProps {
  tokens: (CalculationToken & { uniqueId?: string })[];
  onRemoveToken: (index: number) => void;
  disabled?: boolean;
}

export const BadgeList: React.FC<BadgeListProps> = ({
  tokens,
  onRemoveToken,
  disabled = false
}) => {
  return (
    <>
      {tokens.map((token, index) => (
        <TokenBadge 
          key={token.uniqueId || `${token.id}-${index}`}
          token={token}
          onRemove={() => onRemoveToken(index)}
          disabled={disabled}
        />
      ))}
    </>
  );
};
