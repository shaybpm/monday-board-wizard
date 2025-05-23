
import React, { useEffect } from "react";
import { CalculationToken } from "@/types/calculation";
import { useFormulaDisplay } from "./useFormulaDisplay";
import { SectionHeader } from "./SectionHeader";
import { TokenContainer } from "./TokenContainer";
import { SectionWrapper } from "./SectionWrapper";

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
  sectionType?: "condition" | "then" | "else"; // Section type prop
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
  sectionType = "condition"
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
    sectionType
  });

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
        startEditing();
      }
    }
  };

  useEffect(() => {
    if (onClick) {
      console.log(`[FormulaTokensDisplay] ${label} - Auto-starting edit mode from click handler`);
      startEditing();
    }
  }, [onClick, label]);

  return (
    <div>
      <SectionHeader label={label} />
      <SectionWrapper 
        className={className}
        disabled={disabled}
        onClick={handleContainerClick}
        hasClickHandler={!!onClick}
        isEmpty={tokens.length === 0}
        isEditing={isEditing}
        sectionType={sectionType}
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
      </SectionWrapper>
    </div>
  );
};

export default FormulaTokensDisplay;
