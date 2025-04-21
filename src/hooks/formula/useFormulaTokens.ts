
import { CalculationToken } from '@/types/calculation';
import { useSectionTokenAdder } from './useSectionTokenAdder';
import { useTokenHandling, TokenHandlingProps } from './useTokenHandling';
import { useDirectInput } from './useDirectInput';

export interface FormulaTokensProps extends TokenHandlingProps {
  formula: CalculationToken[];
  onAddLogical: (logical: string) => void;
}

/**
 * Hook for managing formula token operations
 */
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

  // Use our token handling hook
  const { handleAddColumnWrapped } = useTokenHandling({
    isLogicTestMode,
    activeSection,
    onAddToken: (token) => {
      // Check if we're in logic test mode and use section-aware token handler
      if (isLogicTestMode) {
        addTokenToFormula(() => token);
      } else {
        onAddToken(token);
      }
    }
  });

  // Use our direct input hook
  const { handleAddDirectInput } = useDirectInput();

  return {
    handleAddColumnWrapped,
    handleAddDirectInput
  };
};
