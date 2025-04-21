
import { CalculationToken } from '@/types/calculation';
import { useSectionState } from './formula/useSectionState';
import { useSectionTransition } from './formula/useSectionTransition';
import { useFormulaStorage } from './formula/useFormulaStorage';

/**
 * Hook to manage formula sections and formula state for different modes
 */
export const useFormulaSections = (
  formula: CalculationToken[], 
  onFormulaUpdate: (newFormula: CalculationToken[]) => void,
  isLogicTestMode: boolean = false
) => {
  // Use our smaller, focused hooks
  const { activeSection, setActiveSection } = useSectionState();
  const { handleSectionClick: handleSectionTransition } = useSectionTransition(formula, onFormulaUpdate);
  const { calculationFormula, logicTestFormula } = useFormulaStorage(formula, onFormulaUpdate, isLogicTestMode);

  // Wrapper for section click that integrates with section state
  const handleSectionClick = (section: "condition" | "then" | "else") => {
    if (!isLogicTestMode) return; // Only allow section switching in logic test mode
    handleSectionTransition(section, activeSection, setActiveSection);
  };

  return {
    isLogicTestMode,
    activeSection,
    handleSectionClick,
    calculationFormula,
    logicTestFormula
  };
};
