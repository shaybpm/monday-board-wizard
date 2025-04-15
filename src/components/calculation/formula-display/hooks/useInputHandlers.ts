
import { KeyboardEvent } from "react";

interface UseInputHandlersProps {
  sectionType: "condition" | "then" | "else";
  onAddDirectInput?: (text: string, section: "condition" | "then" | "else") => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isProcessingEnter: boolean;
  setIsProcessingEnter: (value: boolean) => void;
  setIsEditing: (value: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

/**
 * Hook to handle input-related events and actions
 */
export const useInputHandlers = ({
  sectionType,
  onAddDirectInput,
  inputValue,
  setInputValue,
  isProcessingEnter,
  setIsProcessingEnter,
  setIsEditing,
  inputRef
}: UseInputHandlersProps) => {
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`[useInputHandlers] Input changed in section "${sectionType}" to: "${e.target.value}"`);
    setInputValue(e.target.value);
  };

  // Safe function to add input with debouncing protection
  const safelyAddInput = (value: string) => {
    if (!value.trim() || !onAddDirectInput) return;
    
    console.log(`[useInputHandlers] Adding direct input: "${value.trim()}" for section: "${sectionType}"`);
    
    // Disable the input and set processing flag BEFORE calling onAddDirectInput
    setIsProcessingEnter(true);
    setInputValue("");
    
    try {
      // Add token with defensive code - this will be specific to this section
      console.log(`[useInputHandlers] 🔍 CALLING onAddDirectInput with text "${value.trim()}" for section "${sectionType}"`);
      // Pass the section type to ensure proper placement
      onAddDirectInput(value.trim(), sectionType);
    } catch (err) {
      console.error(`[useInputHandlers] Error adding input: ${err}`);
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
    console.log(`[useInputHandlers] Key pressed: ${e.key}, value: "${inputValue}", section: "${sectionType}"`);
    
    if (e.key === 'Enter') {
      // Prevent default behavior and stop event propagation
      e.preventDefault();
      e.stopPropagation();
      
      // Early return if we're already processing an Enter key or the input is empty
      if (isProcessingEnter || !inputValue.trim()) {
        console.log(`[useInputHandlers] Ignoring Enter: already processing or empty input`);
        return;
      }

      // Process the input safely
      safelyAddInput(inputValue);
    } else if (e.key === 'Escape') {
      console.log(`[useInputHandlers] Cancelling edit mode`);
      setIsEditing(false);
      setInputValue("");
    }
  };

  // Handle clicks to prevent propagation
  const handleInputClick = (e: React.MouseEvent) => {
    console.log(`[useInputHandlers] Input field clicked for section: "${sectionType}"`);
    e.stopPropagation(); // Prevent triggering container click
  };

  return {
    handleInputChange,
    handleKeyDown,
    handleInputClick
  };
};
