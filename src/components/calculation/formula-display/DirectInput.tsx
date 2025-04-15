
import React from "react";
import { Input } from "@/components/ui/input";

interface DirectInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: (e: React.MouseEvent) => void;
  isProcessing: boolean;
  sectionType?: "condition" | "then" | "else";
}

export const DirectInput: React.FC<DirectInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onClick,
  isProcessing,
  sectionType = "condition"
}) => {
  // Define section-specific appearance
  const getSectionStyles = () => {
    switch (sectionType) {
      case "then":
        return "focus-visible:ring-green-500";
      case "else":
        return "focus-visible:ring-red-500";
      case "condition":
      default:
        return "focus-visible:ring-blue-500";
    }
  };
  
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={`max-w-[150px] h-8 inline-flex ${getSectionStyles()}`}
      placeholder={`Type here (${sectionType})...`}
      autoFocus
      disabled={isProcessing}
      data-section={sectionType}
    />
  );
};
