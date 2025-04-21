
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DirectInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: (e: React.MouseEvent) => void;
  isProcessing: boolean;
  sectionType?: "condition" | "then" | "else";
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const DirectInput: React.FC<DirectInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onClick,
  isProcessing,
  sectionType = "condition",
  inputRef
}) => {
  // Define section-specific appearance
  const getSectionStyles = () => {
    switch (sectionType) {
      case "then":
        return "focus-visible:ring-green-500 border-green-300";
      case "else":
        return "focus-visible:ring-red-500 border-red-300";
      case "condition":
      default:
        return "focus-visible:ring-blue-500 border-blue-300";
    }
  };
  
  // Log when this component renders with section information
  useEffect(() => {
    console.log(`[DirectInput] Rendered for section "${sectionType}" with value: "${value}"`);
    return () => {
      console.log(`[DirectInput] Unmounting from section "${sectionType}"`);
    };
  }, [value, sectionType]);

  // Enhanced logging for key events
  const handleKeyDownWithLogging = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(`[DirectInput] Key "${e.key}" pressed in section "${sectionType}" with value: "${value}"`);
    onKeyDown(e);
  };
  
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDownWithLogging}
      onClick={onClick}
      className={cn(
        "max-w-[150px] h-8 inline-flex",
        getSectionStyles()
      )}
      placeholder={`Type here (${sectionType})...`}
      autoFocus
      disabled={isProcessing}
      data-section={sectionType}
      ref={inputRef}
    />
  );
};
