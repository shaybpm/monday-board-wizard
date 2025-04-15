
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CalculationToken } from "@/types/calculation";
import { Input } from "@/components/ui/input";

interface FormulaTokensDisplayProps {
  tokens: (CalculationToken & { uniqueId?: string })[];
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
  const [isProcessingEnter, setIsProcessingEnter] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Log component re-renders with relevant props
  useEffect(() => {
    console.log(`[FormulaTokensDisplay] Rendered: ${label} - isEditing: ${isEditing}`);
    console.log(`[FormulaTokensDisplay] ${label} - Token count: ${tokens.length}`);
  }, [label, tokens.length, isEditing]);

  // Start direct input editing
  const startEditing = () => {
    if (disabled || !onAddDirectInput) return;
    console.log(`[FormulaTokensDisplay] ${label} - Starting edit mode`);
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

  // Handle input keypresses - FIXED to prevent infinite loops/recursion
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log(`[FormulaTokensDisplay] ${label} - Key pressed: ${e.key}, value: ${inputValue}`);
    
    if (e.key === 'Enter' && inputValue.trim()) {
      // Prevent default behavior and stop event propagation
      e.preventDefault();
      e.stopPropagation();
      
      // Early return if we're already processing an Enter key
      if (isProcessingEnter) {
        console.log(`[FormulaTokensDisplay] ${label} - Already processing an Enter key, ignoring`);
        return;
      }

      // Set flag to prevent multiple simultaneous Enter key processing
      setIsProcessingEnter(true);
      
      console.log(`[FormulaTokensDisplay] ${label} - Adding direct input: ${inputValue.trim()}`);
      
      // Store the current value and clear input field
      const currentValue = inputValue.trim();
      setInputValue("");
      
      // Add token with a slight delay to prevent race conditions
      if (onAddDirectInput) {
        console.log(`[FormulaTokensDisplay] ${label} - Calling onAddDirectInput with: ${currentValue}`);
        onAddDirectInput(currentValue);
      }
      
      // Reset the processing flag and refocus input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
        setIsProcessingEnter(false);
        console.log(`[FormulaTokensDisplay] ${label} - Enter key processing complete`);
      }, 50);
    } else if (e.key === 'Escape') {
      console.log(`[FormulaTokensDisplay] ${label} - Cancelling edit mode`);
      setIsEditing(false);
      setInputValue("");
    }
  };

  // Handle clicks on container and prevent propagation for input
  const handleContainerClick = () => {
    console.log(`[FormulaTokensDisplay] ${label} - Container clicked, onClick handler exists: ${!!onClick}`);
    if (onClick && !disabled) {
      onClick();
      if (!isEditing) {
        startEditing(); // Start editing when container is clicked
      }
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    console.log(`[FormulaTokensDisplay] ${label} - Input field clicked`);
    e.stopPropagation(); // Prevent triggering container click
  };

  // Effect to keep editing state active when section is clicked
  useEffect(() => {
    if (onClick) {
      console.log(`[FormulaTokensDisplay] ${label} - Auto-starting edit mode from click handler`);
      startEditing();
    }
  }, [onClick, label]);

  return (
    <div>
      <h4 className="text-sm font-medium mb-1 text-gray-600">{label}</h4>
      <div 
        className={`p-4 border rounded-md ${className} min-h-16 flex flex-wrap gap-2 items-center 
          ${disabled ? 'opacity-60' : ''} 
          ${onClick && !disabled ? 'cursor-pointer hover:bg-opacity-90 transition-all' : ''}
          ${onClick && !disabled && tokens.length === 0 && !isEditing ? 'animate-pulse' : ''}
        `}
        aria-disabled={disabled}
        onClick={handleContainerClick}
        role={onClick && !disabled ? "button" : undefined}
        data-section={label.toLowerCase().includes("if") ? "condition" : 
                     label.toLowerCase().includes("then") ? "then" : 
                     label.toLowerCase().includes("else") ? "else" : "unknown"}
      >
        {badgePrefix}
        {tokens.length > 0 ? (
          <>
            {tokens.map((token, index) => (
              <Badge 
                key={token.uniqueId || `${token.id}-${index}`}
                variant={getBadgeVariant(token.type)}
                className={`px-3 py-1 ${!disabled ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering container click
                  console.log(`[FormulaTokensDisplay] ${label} - Token clicked to remove: ${token.display}`);
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
                disabled={isProcessingEnter}
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
                disabled={isProcessingEnter}
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
