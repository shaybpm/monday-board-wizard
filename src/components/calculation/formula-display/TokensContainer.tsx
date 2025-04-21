
import React, { useEffect } from "react";
import { CalculationToken } from "@/types/calculation";
import { TokenBadge } from "./Badge";
import { DirectInput } from "./DirectInput";

interface TokensContainerProps {
  tokens: (CalculationToken & { uniqueId?: string })[];
  isEditing: boolean;
  inputValue: string;
  isProcessingEnter: boolean;
  emptyMessage: string;
  onRemoveToken: (index: number) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInputClick: (e: React.MouseEvent) => void;
  onAddDirectInput?: (text: string) => void;
  disabled?: boolean;
  sectionType?: "condition" | "then" | "else"; // Add section type
}

export const TokensContainer: React.FC<TokensContainerProps> = ({
  tokens,
  isEditing,
  inputValue,
  isProcessingEnter,
  emptyMessage,
  onRemoveToken,
  onInputChange,
  onKeyDown,
  onInputClick,
  onAddDirectInput,
  disabled = false,
  sectionType = "condition" // Default to condition
}) => {
  // Log component state on mount and updates
  useEffect(() => {
    console.log(`[TokensContainer] Rendered for section "${sectionType}" - isEditing: ${isEditing}, tokens: ${tokens.length}, inputValue: "${inputValue}"`);
    if (tokens.length > 0) {
      console.log(`[TokensContainer] ${sectionType} section tokens:`, tokens.map(t => `${t.type}:${t.display}`).join(', '));
    }
  }, [sectionType, isEditing, tokens, inputValue]);

  // Enhanced input change handler with logging
  const handleInputChangeWithLogging = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`[TokensContainer] Input changed in section "${sectionType}" to: "${e.target.value}"`);
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
        {isEditing && onAddDirectInput && (
          <DirectInput
            value={inputValue}
            onChange={handleInputChangeWithLogging}
            onKeyDown={onKeyDown}
            isProcessing={isProcessingEnter}
            onClick={onInputClick}
            sectionType={sectionType} // Pass section type to DirectInput
          />
        )}
      </>
    );
  }
  
  return (
    <>
      <span className={`text-gray-400 ${!disabled && !isEditing ? 'pointer-events-none' : ''}`}>
        {isEditing && onAddDirectInput ? "" : emptyMessage}
      </span>
      {isEditing && onAddDirectInput && (
        <DirectInput
          value={inputValue}
          onChange={handleInputChangeWithLogging}
          onKeyDown={onKeyDown}
          isProcessing={isProcessingEnter}
          onClick={onInputClick}
          sectionType={sectionType} // Pass section type to DirectInput
        />
      )}
    </>
  );
};
