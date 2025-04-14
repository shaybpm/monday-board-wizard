
import React, { useState, useRef, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";
import { Input } from "@/components/ui/input";

interface FormulaTokensDisplayProps {
  tokens: CalculationToken[];
  label: string;
  emptyMessage: string;
  badgePrefix?: React.ReactNode;
  className?: string;
  onRemoveToken: (index: number) => void;
  onAddDirectInput?: (text: string) => void;
  startIndex?: number;
  disabled?: boolean;
  onClick?: () => void; // Add click handler for the container
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
  onClick, // Use the click handler
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Start direct input editing
  const startEditing = () => {
    if (disabled || !onAddDirectInput) return;
    setIsEditing(true);
    setInputValue("");
    // Focus the input after it renders
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle input keypresses
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onAddDirectInput(inputValue.trim());
      setInputValue("");
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue("");
    }
  };

  // Handle clicks on container and prevent propagation for input
  const handleContainerClick = () => {
    if (onClick && !disabled) {
      onClick();
      startEditing(); // Start editing when container is clicked
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering container click
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-1 text-gray-600">{label}</h4>
      <div 
        className={`p-4 border rounded-md ${className} min-h-16 flex flex-wrap gap-2 items-center 
          ${disabled ? 'opacity-60' : ''} 
          ${onClick && !disabled ? 'cursor-pointer hover:bg-opacity-90 transition-all' : ''}
          ${onClick && !disabled && tokens.length === 0 ? 'animate-pulse' : ''}
        `}
        aria-disabled={disabled}
        onClick={handleContainerClick}
        role={onClick && !disabled ? "button" : undefined}
      >
        {badgePrefix}
        {tokens.length > 0 ? (
          <>
            {tokens.map((token, index) => (
              <Badge 
                key={token.id || index}
                variant={getBadgeVariant(token.type)}
                className={`px-3 py-1 ${!disabled ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering container click
                  if (!disabled) onRemoveToken(index);
                }}
              >
                {token.display}
              </Badge>
            ))}
            {isEditing && onAddDirectInput && (
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={handleInputClick}
                className="max-w-[150px] h-8 inline-flex"
                placeholder="Type here..."
                autoFocus
              />
            )}
          </>
        ) : (
          <>
            <span className={`text-gray-400 ${onClick && !disabled && !isEditing ? 'pointer-events-none' : ''}`}>
              {isEditing && onAddDirectInput ? "" : emptyMessage}
            </span>
            {isEditing && onAddDirectInput && (
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={handleInputClick}
                className="max-w-[150px] h-8 inline-flex"
                placeholder="Type here..."
                autoFocus
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to determine badge variant based on token type
const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'operator': return 'secondary';
    case 'number': return 'outline';
    case 'condition': return 'destructive'; 
    case 'logical': 
      return 'default';
    default: return 'default';
  }
};

export default FormulaTokensDisplay;
