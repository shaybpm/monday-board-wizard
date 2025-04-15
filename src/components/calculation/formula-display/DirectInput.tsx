
import React, { useRef, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface DirectInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const DirectInput: React.FC<DirectInputProps> = ({ 
  value, 
  onChange, 
  onKeyDown, 
  isProcessing,
  onClick
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when it's mounted
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className="max-w-[150px] h-8 inline-flex"
      placeholder="Type here..."
      autoFocus
      disabled={isProcessing}
    />
  );
};
