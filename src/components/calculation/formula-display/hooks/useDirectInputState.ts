
import { useState, useRef, useEffect } from "react";

interface UseDirectInputStateProps {
  sectionType: "condition" | "then" | "else";
}

/**
 * Hook to manage the state of direct input within formula sections
 */
export const useDirectInputState = ({ sectionType }: UseDirectInputStateProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isProcessingEnter, setIsProcessingEnter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Log section and state on updates
  useEffect(() => {
    console.log(`[useDirectInputState] State updated for "${sectionType}" - isEditing: ${isEditing}, inputValue: "${inputValue}"`);
  }, [sectionType, isEditing, inputValue]);

  return {
    isEditing,
    inputValue,
    isProcessingEnter,
    inputRef,
    setIsEditing,
    setInputValue,
    setIsProcessingEnter
  };
};
