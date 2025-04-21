
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';
import { useSectionValidation } from './useSectionValidation';

interface NumberInputHandlerProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  formula: CalculationToken[];
  onAddToken: (token: CalculationToken) => void;
}

export const useNumberInputHandler = ({
  isLogicTestMode,
  activeSection,
  formula,
  onAddToken
}: NumberInputHandlerProps) => {
  // Use our section validation hook to check if sections exist
  const { validateSection } = useSectionValidation(formula);

  const handleNumberInput = (numberPrompt: string | null) => {
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
        addTokenToActiveSection(numberToken);
      }
    } else if (numberPrompt !== null) {
      // Show error only if user didn't cancel
      console.log("[Number Input] Invalid number input");
      toast.error("Please enter a valid number");
    } else {
      console.log("[Number Input] User cancelled input");
    }
  };

  // Helper to add a token to the active section
  const addTokenToActiveSection = (numberToken: CalculationToken) => {
    console.log(`[Number Input] Logic test mode, active section: ${activeSection}`);
    
    // Validate the current section has the necessary operators
    if (validateSection(activeSection)) {
      console.log(`[Number Input] Adding to ${activeSection} section`);
      onAddToken(numberToken);
    }
  };

  return {
    handleNumberInput
  };
};
