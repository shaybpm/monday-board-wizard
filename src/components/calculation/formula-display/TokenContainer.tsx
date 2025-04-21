
import React from "react";
import { CalculationToken } from "@/types/calculation";
import { DirectInput } from "./DirectInput";
import { BadgeList } from "./BadgeList";
import { EmptyStateDisplay } from "./EmptyStateDisplay";

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

  const renderInputField = () => {
    if (!isEditing) return null;
    
    return (
      <DirectInput
        value={inputValue}
        onChange={handleInputChangeWithLogging}
        onKeyDown={onKeyDown}
        isProcessing={isProcessingEnter}
        onClick={onInputClick}
        sectionType={sectionType}
      />
    );
  };

  return (
    <>
      {tokens.length > 0 ? (
        <>
          <BadgeList 
            tokens={tokens}
            onRemoveToken={onRemoveToken}
            disabled={disabled}
          />
          {renderInputField()}
        </>
      ) : (
        <>
          <EmptyStateDisplay 
            message={emptyMessage}
            isEditing={isEditing}
            disabled={disabled}
          />
          {renderInputField()}
        </>
      )}
    </>
  );
};
