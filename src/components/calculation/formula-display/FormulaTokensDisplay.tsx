import React, { useEffect } from "react";
import { CalculationToken } from "@/types/calculation";
import { useFormulaDisplay } from "./useFormulaDisplay";
import { SectionHeader } from "./SectionHeader";
import { TokenContainer } from "./TokenContainer";

interface FormulaTokensDisplayProps {
  tokens: (CalculationToken & { uniqueId?: string })[];
  label: string;
  emptyMessage: string;
  badgePrefix?: React.ReactNode;
  className?: string;
  onRemoveToken: (index: number) => void;
  onAddDirectInput?: (text: string, section: "condition" | "then" | "else") => void;
  startIndex?: number;
  disabled?: boolean;
  onClick?: () => void; // Click handler for the container
  sectionType?: "condition" | "then" | "else"; // Added section type prop
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
  sectionType = "condition" // Default to condition if not specified
}) => {
  const {
    isEditing,
    inputValue,
    isProcessingEnter,
    inputRef,
    startEditing,
    setIsEditing,
    handleInputChange,
    handleKeyDown,
    handleInputClick
  } = useFormulaDisplay({
    onAddDirectInput,
    disabled,
    sectionType // Pass section type to useFormulaDisplay
  });

  // Log component re-renders with relevant props
  useEffect(() => {
    console.log(`[FormulaTokensDisplay] Rendered: ${label} - isEditing: ${isEditing}, sectionType: ${sectionType}`);
    console.log(`[FormulaTokensDisplay] ${label} - Token count: ${tokens.length}`);
  }, [label, tokens.length, isEditing, sectionType]);

  // Handle clicks on container
  const handleContainerClick = () => {
    console.log(`[FormulaTokensDisplay] ${label} - Container clicked, onClick handler exists: ${!!onClick}, sectionType: ${sectionType}`);
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
      <SectionHeader label={label} />
      <div 
        className={`p-4 border rounded-md ${className} min-h-16 flex flex-wrap gap-2 items-center 
          ${disabled ? 'opacity-60' : ''} 
          ${onClick && !disabled ? 'cursor-pointer hover:bg-opacity-90 transition-all' : ''}
          ${onClick && !disabled && tokens.length === 0 && !isEditing ? 'animate-pulse' : ''}
        `}
        aria-disabled={disabled}
        onClick={handleContainerClick}
        role={onClick && !disabled ? "button" : undefined}
        data-section={sectionType}
      >
        {badgePrefix}
        <TokenContainer
          tokens={tokens}
          isEditing={isEditing}
          inputValue={inputValue}
          isProcessingEnter={isProcessingEnter}
          emptyMessage={emptyMessage}
          onRemoveToken={onRemoveToken}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onInputClick={handleInputClick}
          disabled={disabled}
          sectionType={sectionType}
        />
      </div>
    </div>
  );
};

export default FormulaTokensDisplay;
