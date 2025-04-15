
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';
import { useNumberInputState } from './useNumberInputState';
import { useNumberInputHandler } from './useNumberInputHandler';

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
  // Use our extracted state hook
  const { isNumberInputActive, setNumberInputActive, setNumberInputInactive } = useNumberInputState();
  
  // Use our extracted handler hook
  const { handleNumberInput } = useNumberInputHandler({
    isLogicTestMode,
    activeSection,
    formula,
    onAddToken
  });

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
      
      // Process the input through our handler
      handleNumberInput(numberPrompt);
    } catch (err) {
      console.error("[Number Input] Error handling number input:", err);
      toast.error("Failed to process number input");
    } finally {
      // Always reset the global flag when done
      console.log("[Number Input] Resetting global flag");
      setNumberInputInactive();
    }
  };

  return {
    handleAddNumberWrapped
  };
};
