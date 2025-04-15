
import { useEffect } from "react";
import { useDirectInputState } from "./hooks/useDirectInputState";
import { useInputEditing } from "./hooks/useInputEditing";
import { useInputHandlers } from "./hooks/useInputHandlers";

interface UseFormulaDisplayProps {
  onAddDirectInput?: (text: string, section: "condition" | "then" | "else") => void;
  disabled?: boolean;
  sectionType?: "condition" | "then" | "else";
}

/**
 * Main hook that combines smaller, focused hooks to handle formula display and editing
 */
export const useFormulaDisplay = ({ 
  onAddDirectInput, 
  disabled = false, 
  sectionType = "condition" 
}: UseFormulaDisplayProps) => {
  // Use the focused state management hook
  const {
    isEditing,
    inputValue,
    isProcessingEnter,
    inputRef,
    setIsEditing,
    setInputValue,
    setIsProcessingEnter
  } = useDirectInputState({ sectionType });

  // Use the input editing hook
  const { startEditing } = useInputEditing({
    disabled,
    onAddDirectInput,
    sectionType,
    isEditing,
    setIsEditing,
    inputRef,
    setInputValue
  });

  // Use the input handlers hook
  const {
    handleInputChange,
    handleKeyDown,
    handleInputClick
  } = useInputHandlers({
    sectionType,
    onAddDirectInput,
    inputValue,
    setInputValue,
    isProcessingEnter,
    setIsProcessingEnter,
    setIsEditing,
    inputRef
  });

  // Log initialization for debugging
  useEffect(() => {
    console.log(`[useFormulaDisplay] Hook initialized for section "${sectionType}"`);
  }, [sectionType]);

  return {
    isEditing,
    inputValue,
    isProcessingEnter,
    inputRef,
    startEditing,
    setIsEditing,
    handleInputChange,
    handleKeyDown,
    handleInputClick
  };
};
