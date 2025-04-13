
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
    
    try {
      // Immediately show the prompt to get user input for the number
      const numberPrompt = prompt("Enter a number:");
      console.log(`[Number Input] User entered: "${numberPrompt}"`);
      
      // Only continue if the user entered a valid number
      if (numberPrompt && !isNaN(Number(numberPrompt))) {
        console.log(`[Number Input] Valid number input: ${numberPrompt}`);
        
        // Create the number token
        const numberToken = {
          id: `num-${Date.now()}`,
          type: "number" as const,
          value: numberPrompt,
          display: numberPrompt
        };
        console.log("[Number Input] Token created:", numberToken);
        
        // For regular calculation mode, add directly
        if (!isLogicTestMode) {
          console.log("[Number Input] Adding in calculation mode");
          onAddToken(numberToken);
        } else {
          // For logic test mode, check which section is active
          console.log(`[Number Input] Logic test mode, active section: ${activeSection}`);
          switch (activeSection) {
            case "condition":
              if (formula.some(token => token.type === "logical" && token.value === "if")) {
                console.log("[Number Input] Adding to condition section");
                onAddToken(numberToken);
              } else {
                console.log("[Number Input] Error: No IF operator found");
                toast.warning("Add an IF operator first");
              }
              break;
              
            case "then":
              if (formula.some(token => token.type === "logical" && token.value === "then")) {
                console.log("[Number Input] Adding to THEN section");
                onAddToken(numberToken);
              } else {
                console.log("[Number Input] Error: No THEN operator found");
                toast.warning("Add a THEN operator first");
              }
              break;
              
            case "else":
              if (formula.some(token => token.type === "logical" && token.value === "else")) {
                console.log("[Number Input] Adding to ELSE section");
                onAddToken(numberToken);
              } else {
                console.log("[Number Input] Error: No ELSE operator found");
                toast.warning("Add an ELSE operator first");
              }
              break;
          }
        }
      } else if (numberPrompt !== null) {
        // Show error only if user didn't cancel
        console.log("[Number Input] Invalid number input");
        toast.error("Please enter a valid number");
      } else {
        console.log("[Number Input] User cancelled input");
      }
    } finally {
      // Reset the global flag immediately when we're done with processing
      setNumberInputInactive();
    }
  };

  return {
    handleAddNumberWrapped
  };
};
