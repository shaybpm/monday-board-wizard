
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';
import { useNumberInputState } from './useNumberInputState';

export interface NumberInputProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  formula: CalculationToken[];
  onAddToken: (token: CalculationToken) => void;
}

export const useNumberInput = ({
  isLogicTestMode,
  activeSection,
  formula,
  onAddToken
}: NumberInputProps) => {
  const { isNumberInputActive, setNumberInputActive, setNumberInputInactive } = useNumberInputState();

  const handleAddNumberWrapped = () => {
    // Check global flag to prevent multiple simultaneous calls
    if (isNumberInputActive()) {
      console.log("[Number Input] BLOCKED: Another number input is already active");
      return;
    }
    
    // Set global flag to prevent multiple simultaneous processes
    setNumberInputActive();
    console.log("[Number Input Debug] Starting number input process");
    
    try {
      // Show the prompt to get user input for the number
      const numberPrompt = prompt("Enter a number:");
      console.log(`[Number Input] User entered: "${numberPrompt}"`);
      
      // Only continue if the user entered a valid number
      if (numberPrompt !== null && !isNaN(Number(numberPrompt))) {
        console.log(`[Number Input] Valid number input: ${numberPrompt}`);
        
        // Create number token with "number" type
        const numberToken: CalculationToken = {
          id: `num-${Date.now()}`,
          type: "number", // Ensure we're using "number" type
          value: numberPrompt,
          display: numberPrompt
        };
        console.log("[Number Input] Token created:", numberToken);
        
        // For regular calculation mode, add directly
        if (!isLogicTestMode) {
          console.log("[Number Input] Adding in calculation mode");
          onAddToken(numberToken);
        } else {
          // For logic test mode, respect the active section
          handleLogicTestModeNumberInput(numberToken);
        }
      } else if (numberPrompt !== null) {
        // Show error only if user didn't cancel
        console.log("[Number Input] Invalid number input");
        toast.error("Please enter a valid number");
      } else {
        console.log("[Number Input] User cancelled input");
      }
    } catch (err) {
      console.error("[Number Input] Error handling number input:", err);
      toast.error("Failed to process number input");
    } finally {
      // Always reset the global flag when done
      console.log("[Number Input] Resetting global flag");
      setNumberInputInactive();
    }
  };

  // Helper function to handle logic test mode
  const handleLogicTestModeNumberInput = (numberToken: CalculationToken) => {
    console.log(`[Number Input] Logic test mode, active section: ${activeSection}`);
    
    try {
      // Find section indicators in formula
      const hasIf = formula.some(token => token.type === "logical" && token.value === "if");
      const hasThen = formula.some(token => token.type === "logical" && token.value === "then");
      const hasElse = formula.some(token => token.type === "logical" && token.value === "else");
      
      switch (activeSection) {
        case "condition":
          if (hasIf) {
            console.log("[Number Input] Adding to condition section");
            onAddToken(numberToken);
          } else {
            console.log("[Number Input] Error: No IF operator found");
            toast.warning("Add an IF operator first");
          }
          break;
          
        case "then":
          if (hasThen) {
            console.log("[Number Input] Adding to THEN section");
            onAddToken(numberToken);
          } else {
            console.log("[Number Input] Error: No THEN operator found");
            toast.warning("Add a THEN operator first");
          }
          break;
          
        case "else":
          if (hasElse) {
            console.log("[Number Input] Adding to ELSE section");
            onAddToken(numberToken);
          } else {
            console.log("[Number Input] Error: No ELSE operator found");
            toast.warning("Add an ELSE operator first");
          }
          break;
      }
    } catch (err) {
      console.error("[Number Input] Error in logic test mode:", err);
    }
  };

  return {
    handleAddNumberWrapped
  };
};
