
import { useState, useRef, KeyboardEvent, useEffect } from "react";

interface UseFormulaDisplayProps {
  onAddDirectInput?: (text: string) => void;
  disabled?: boolean;
  sectionType?: "condition" | "then" | "else"; // Add section type
}

export const useFormulaDisplay = ({ onAddDirectInput, disabled = false, sectionType = "condition" }: UseFormulaDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isProcessingEnter, setIsProcessingEnter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Log section and state on mount and updates
  useEffect(() => {
    console.log(`[useFormulaDisplay] Hook initialized for section "${sectionType}" - isEditing: ${isEditing}, inputValue: "${inputValue}"`);
  }, [sectionType, isEditing, inputValue]);

  // Start direct input editing
  const startEditing = () => {
    if (disabled || !onAddDirectInput) return;
    console.log(`[FormulaTokensDisplay] Starting edit mode for section: ${sectionType}`);
    setIsEditing(true);
    setInputValue("");
    // Focus the input after it renders
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`[useFormulaDisplay] Input changed in section "${sectionType}" to: "${e.target.value}"`);
    setInputValue(e.target.value);
  };

  // Safe function to add input with debouncing protection
  const safelyAddInput = (value: string) => {
    if (!value.trim() || !onAddDirectInput) return;
    
    console.log(`[FormulaTokensDisplay] Adding direct input: "${value.trim()}" for section: "${sectionType}"`);
    
    // Disable the input and set processing flag BEFORE calling onAddDirectInput
    setIsProcessingEnter(true);
    setInputValue("");
    
    try {
      // Add token with defensive code - this will be specific to this section
      console.log(`[useFormulaDisplay] 🔍 CALLING onAddDirectInput with text "${value.trim()}" for section "${sectionType}"`);
      onAddDirectInput(value.trim());
    } catch (err) {
      console.error(`[FormulaTokensDisplay] Error adding input: ${err}`);
    } finally {
      // Reset the processing flag and refocus input with delay
      setTimeout(() => {
        setIsProcessingEnter(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Handle input keypresses with improved safety
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log(`[FormulaTokensDisplay] Key pressed: ${e.key}, value: "${inputValue}", section: "${sectionType}"`);
    
    if (e.key === 'Enter') {
      // Prevent default behavior and stop event propagation
      e.preventDefault();
      e.stopPropagation();
      
      // Early return if we're already processing an Enter key or the input is empty
      if (isProcessingEnter || !inputValue.trim()) {
        console.log(`[FormulaTokensDisplay] Ignoring Enter: already processing or empty input`);
        return;
      }

      // Process the input safely
      safelyAddInput(inputValue);
    } else if (e.key === 'Escape') {
      console.log(`[FormulaTokensDisplay] Cancelling edit mode`);
      setIsEditing(false);
      setInputValue("");
    }
  };

  // Handle clicks to prevent propagation
  const handleInputClick = (e: React.MouseEvent) => {
    console.log(`[FormulaTokensDisplay] Input field clicked for section: "${sectionType}"`);
    e.stopPropagation(); // Prevent triggering container click
  };

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
