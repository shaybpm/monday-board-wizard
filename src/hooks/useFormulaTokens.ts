
import { CalculationToken } from '@/types/calculation';
import { useNumberInput } from './formula/useNumberInput';
import { useSectionTokenAdder } from './formula/useSectionTokenAdder';

interface FormulaTokensProps {
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
  // Use our number input hook
  const { handleAddNumberWrapped } = useNumberInput({
    isLogicTestMode,
    activeSection,
    formula,
    onAddToken
  });
  
  // Use our section token adder hook
  const { addTokenToFormula } = useSectionTokenAdder({
    formula,
    isLogicTestMode,
    activeSection,
    onAddToken
  });

  // Override handlers to use our section-aware logic
  const handleAddColumnWrapped = (column: any) => {
    // In calculation mode, add directly to formula regardless of section
    if (!isLogicTestMode) {
      console.log("[TokenHandler] Adding column directly in calculation mode:", column);
      onAddToken({
        id: column.id,
        type: "column" as const,
        value: column.id,
        display: column.title
      });
      return;
    }
    
    // In logic test mode, use the section-aware handler
    addTokenToFormula(() => ({
      id: column.id,
      type: "column" as const,
      value: column.id,
      display: column.title
    }));
  };

  const handleAddOperatorWrapped = (operator: string) => {
    // In calculation mode, add directly to formula regardless of section
    if (!isLogicTestMode) {
      console.log("[TokenHandler] Adding operator directly in calculation mode:", operator);
      onAddToken({
        id: `op-${Date.now()}`,
        type: "operator" as const,
        value: operator,
        display: operator
      });
      return;
    }
    
    // In logic test mode, use the section-aware handler
    addTokenToFormula(() => ({
      id: `op-${Date.now()}`,
      type: "operator" as const,
      value: operator,
      display: operator
    }));
  };

  const handleAddConditionWrapped = (condition: string) => {
    // Condition operators only make sense in logic test mode
    if (!isLogicTestMode) {
      console.log("[TokenHandler] Not adding condition in calculation mode");
      return;
    }
    
    addTokenToFormula(() => ({
      id: `cond-${Date.now()}`,
      type: "condition" as const,
      value: condition,
      display: condition
    }));
  };

  // Add a handler for direct text input
  const handleAddDirectInput = (text: string, section: "condition" | "then" | "else") => {
    // This function will be expanded in the FormulaBuilder
    console.log(`Direct input: ${text} for section ${section}`);
    
    // Return the text and section, but the actual token creation
    // will happen in FormulaBuilder
    return {
      text,
      section
    };
  };

  return {
    handleAddColumnWrapped,
    handleAddOperatorWrapped,
    handleAddNumberWrapped,
    handleAddConditionWrapped,
    handleAddDirectInput
  };
};
