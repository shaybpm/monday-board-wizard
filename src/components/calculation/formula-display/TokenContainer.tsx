
import React from "react";
import { CalculationToken } from "@/types/calculation";
import { TokenBadge } from "./Badge";
import { DirectInput } from "./DirectInput";

interface TokenContainerProps {
  tokens: (CalculationToken & { uniqueId?: string })[];
  isEditing: boolean;
  inputValue: string;
  isProcessingEnter: boolean;
  emptyMessage: string;
  onRemoveToken: (index: number) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  sectionType: "condition" | "then" | "else";
}

export const TokenContainer: React.FC<TokenContainerProps> = ({
  tokens,
  isEditing,
  inputValue,
  isProcessingEnter,
  emptyMessage,
  onRemoveToken,
  onInputChange,
  onKeyDown,
  onInputClick,
  disabled = false,
  sectionType
}) => {
  // Enhanced input change handler with logging
  const handleInputChangeWithLogging = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`[TokenContainer] Input changed in section "${sectionType}" to: "${e.target.value}"`);
    onInputChange(e);
  };

  if (tokens.length > 0) {
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
        {isEditing && (
          <DirectInput
            value={inputValue}
            onChange={handleInputChangeWithLogging}
            onKeyDown={onKeyDown}
            isProcessing={isProcessingEnter}
            onClick={onInputClick}
            sectionType={sectionType}
          />
        )}
      </>
    );
  }
  
  return (
    <>
      <span className={`text-gray-400 ${!disabled && !isEditing ? 'pointer-events-none' : ''}`}>
        {isEditing ? "" : emptyMessage}
      </span>
      {isEditing && (
        <DirectInput
          value={inputValue}
          onChange={handleInputChangeWithLogging}
          onKeyDown={onKeyDown}
          isProcessing={isProcessingEnter}
          onClick={onInputClick}
          sectionType={sectionType}
        />
      )}
    </>
  );
};
