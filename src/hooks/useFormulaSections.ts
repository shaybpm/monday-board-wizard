
import { useState, useEffect } from 'react';
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

export const useFormulaSections = (formula: CalculationToken[]) => {
  // Add state for formula mode (calculation or logic test)
  const [isLogicTestMode, setIsLogicTestMode] = useState(() => {
    // Initialize based on formula content - if it has if/then/else tokens, use logic test mode
    return formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value));
  });
  
  // Add state for active section in logic test mode
  const [activeSection, setActiveSection] = useState<"condition" | "then" | "else">("condition");

  // When a formula section is clicked, set it as active
  const handleSectionClick = (section: "condition" | "then" | "else") => {
    setActiveSection(section);
    
    // Visual feedback for which section is active
    toast.info(`Now adding to ${section.toUpperCase()} section`, {
      duration: 1500,
    });
  };

  // Handle mode toggle
  const handleModeToggle = (checked: boolean) => {
    setIsLogicTestMode(checked);
    setActiveSection("condition");
    
    // If switching to logic test mode and no IF token yet, return true to indicate IF needs to be added
    return checked && !formula.some(token => token.type === "logical" && token.value === "if");
  };

  return {
    isLogicTestMode,
    activeSection,
    handleSectionClick,
    handleModeToggle
  };
};
