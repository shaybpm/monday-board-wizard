
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
    console.log("[Number Input] Starting number input flow - GLOBAL FLAG SET");
    
    try {
      // Show the prompt to get user input for the number
      const numberPrompt = prompt("Enter a number:");
      console.log(`[Number Input] User entered: "${numberPrompt}"`);
      
      // Only continue if the user entered a valid number
      if (numberPrompt && !isNaN(Number(numberPrompt))) {
        console.log(`[Number Input] Valid number input: ${numberPrompt}`);
        
        // Create the number token
        const numberToken: CalculationToken = {
          id: `num-${Date.now()}`,
          type: "number",
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
          
          const ifExists = formula.some(token => token.type === "logical" && token.value === "if");
          const thenExists = formula.some(token => token.type === "logical" && token.value === "then");
          const elseExists = formula.some(token => token.type === "logical" && token.value === "else");
          
          switch (activeSection) {
            case "condition":
              if (ifExists) {
                console.log("[Number Input] Adding to condition section");
                onAddToken(numberToken);
              } else {
                console.log("[Number Input] Error: No IF operator found");
                toast.warning("Add an IF operator first");
              }
              break;
              
            case "then":
              if (thenExists) {
                console.log("[Number Input] Adding to THEN section");
                onAddToken(numberToken);
              } else {
                console.log("[Number Input] Error: No THEN operator found");
                toast.warning("Add a THEN operator first");
              }
              break;
              
            case "else":
              if (elseExists) {
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
    } catch (error) {
      console.error("[Number Input] Error processing number input:", error);
      toast.error("Error processing number input");
    } finally {
      // Reset the global flag IMMEDIATELY when we're done with processing
      console.log("[Number Input] Resetting global flag");
      setNumberInputInactive();
    }
  };

  return {
    handleAddNumberWrapped
  };
};
