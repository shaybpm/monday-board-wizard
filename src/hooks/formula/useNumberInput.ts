
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
        
        // IMPORTANT: Create number token with "number" type instead of treating it like a column
        const numberToken: CalculationToken = {
          id: `num-${Date.now()}`,
          type: "number",
          value: numberPrompt,
          display: numberPrompt
        };
        console.log("[Number Input] Token created:", numberToken);
        
        // Add the token directly to the formula
        console.log("[Number Input] Adding token DIRECTLY to formula");
        onAddToken(numberToken);
      } else if (numberPrompt !== null) {
        // Show error only if user didn't cancel
        console.log("[Number Input] Invalid number input");
        toast.error("Please enter a valid number");
      } else {
        console.log("[Number Input] User cancelled input");
      }
    } finally {
      // Reset the global flag IMMEDIATELY when done
      console.log("[Number Input] Resetting global flag");
      setNumberInputInactive();
    }
  };

  return {
    handleAddNumberWrapped
  };
};
