import React, { useEffect } from "react";
import { TokensContainer } from "./TokensContainer";
import { useFormulaDisplay } from "./useFormulaDisplay";
import { CalculationToken } from "@/types/calculation";

interface FormulaTokensDisplayProps {
  tokens: (CalculationToken & { uniqueId?: string })[];
  label: string;
  emptyMessage: string;
  badgePrefix?: React.ReactNode;
  className?: string;
  onRemoveToken: (index: number) => void;
  onAddDirectInput?: (text: string) => void;
  startIndex?: number;
  disabled?: boolean;
  onClick?: () => void; // Click handler for the container
}

const FormulaTokensDisplay: React.FC<FormulaTokensDisplayProps> = ({
  tokens,
  label,
  emptyMessage,
  badgePrefix,
  className = "bg-gray-50",
  onRemoveToken,
  onAddDirectInput,
  startIndex = 0,
  disabled = false,
  onClick,
}) => {
  const {
    isEditing,
    inputValue,
    isProcessingEnter,
    startEditing,
    handleInputChange,
    handleKeyDown,
    handleInputClick
  } = useFormulaDisplay({
    onAddDirectInput,
    disabled
  });

  // Log component re-renders with relevant props
  useEffect(() => {
    console.log(`[FormulaTokensDisplay] Rendered: ${label} - isEditing: ${isEditing}`);
    console.log(`[FormulaTokensDisplay] ${label} - Token count: ${tokens.length}`);
  }, [label, tokens.length, isEditing]);

  // Handle clicks on container
  const handleContainerClick = () => {
    console.log(`[FormulaTokensDisplay] ${label} - Container clicked, onClick handler exists: ${!!onClick}`);
    if (onClick && !disabled) {
      onClick();
      if (!isEditing) {
        startEditing(); // Start editing when container is clicked
      }
    }
  };

  // Effect to keep editing state active when section is clicked
  useEffect(() => {
    if (onClick) {
      console.log(`[FormulaTokensDisplay] ${label} - Auto-starting edit mode from click handler`);
      startEditing();
    }
  }, [onClick, label]);

  return (
    <div>
      <h4 className="text-sm font-medium mb-1 text-gray-600">{label}</h4>
      <div 
        className={`p-4 border rounded-md ${className} min-h-16 flex flex-wrap gap-2 items-center 
          ${disabled ? 'opacity-60' : ''} 
          ${onClick && !disabled ? 'cursor-pointer hover:bg-opacity-90 transition-all' : ''}
          ${onClick && !disabled && tokens.length === 0 && !isEditing ? 'animate-pulse' : ''}
        `}
        aria-disabled={disabled}
        onClick={handleContainerClick}
        role={onClick && !disabled ? "button" : undefined}
        data-section={label.toLowerCase().includes("if") ? "condition" : 
                     label.toLowerCase().includes("then") ? "then" : 
                     label.toLowerCase().includes("else") ? "else" : "unknown"}
      >
        {badgePrefix}
        <TokensContainer
          tokens={tokens}
          isEditing={isEditing}
          inputValue={inputValue}
          isProcessingEnter={isProcessingEnter}
          emptyMessage={emptyMessage}
          onRemoveToken={onRemoveToken}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onInputClick={handleInputClick}
          onAddDirectInput={onAddDirectInput}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default FormulaTokensDisplay;
