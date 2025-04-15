
import { CalculationToken } from '@/types/calculation';
import { useSectionTokenAdder } from './useSectionTokenAdder';

export interface FormulaTokensProps {
  formula: CalculationToken[];
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  onAddToken: (token: CalculationToken) => void;
  onAddLogical: (logical: string) => void;
}

export const useFormulaTokens = ({
  formula,
  isLogicTestMode,
  activeSection,
  onAddToken,
  onAddLogical
}: FormulaTokensProps) => {
  // Log the active section and mode for debugging
  console.log(`[useFormulaTokens] Active section: ${activeSection}, Logic test mode: ${isLogicTestMode}`);
  
  // Use our section token adder hook
  const { addTokenToFormula } = useSectionTokenAdder({
    formula,
    isLogicTestMode,
    activeSection,
    onAddToken
  });

  // Override handlers to use our section-aware logic
  const handleAddColumnWrapped = (column: any) => {
    console.log(`[useFormulaTokens] Adding column ${column.id} to ${activeSection} section`);
    
    // Always use the section-aware handler in logic test mode
    if (isLogicTestMode) {
      addTokenToFormula(() => ({
        id: column.id,
        type: "column" as const,
        value: column.id,
        display: column.title
      }));
      return;
    }
    
    // In calculation mode, add directly to formula regardless of section
    console.log("[TokenHandler] Adding column directly in calculation mode:", column);
    onAddToken({
      id: column.id,
      type: "column" as const,
      value: column.id,
      display: column.title
    });
  };

  // Add a handler for direct text input
  const handleAddDirectInput = (text: string, section: "condition" | "then" | "else") => {
    // Log the input for debugging
    console.log(`[useFormulaTokens] Direct input: ${text} for section ${section} (active section: ${activeSection})`);
    
    // Return the text and section, but the actual token creation
    // will happen in FormulaBuilder
    return {
      text,
      section
    };
  };

  return {
    handleAddColumnWrapped,
    handleAddDirectInput
  };
};
