
import { useEffect } from "react";

interface UseInputEditingProps {
  disabled: boolean;
  onAddDirectInput?: (text: string, section: "condition" | "then" | "else") => void;
  sectionType: "condition" | "then" | "else";
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  setInputValue: (value: string) => void;
}

/**
 * Hook to handle starting and managing input editing mode
 */
export const useInputEditing = ({
  disabled,
  onAddDirectInput,
  sectionType,
  isEditing,
  setIsEditing,
  inputRef,
  setInputValue
}: UseInputEditingProps) => {
  // Start direct input editing
  const startEditing = () => {
    if (disabled || !onAddDirectInput) return;
    console.log(`[useInputEditing] Starting edit mode for section: ${sectionType}`);
    setIsEditing(true);
    setInputValue("");
    // Focus the input after it renders
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  // Effect to handle auto-focusing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      console.log(`[useInputEditing] Auto-focusing input for section: ${sectionType}`);
      inputRef.current.focus();
    }
  }, [isEditing, sectionType]);

  return {
    startEditing
  };
};
