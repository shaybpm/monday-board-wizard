
import React from "react";
import { useFormulaSections } from "@/hooks/useFormulaSections";
import { CalculationToken } from "@/types/calculation";

interface SectionManagerProps {
  formula: CalculationToken[];
  isLogicTestMode: boolean;
  onFormulaUpdate: (newFormula: CalculationToken[]) => void;
  children: (props: {
    activeSection: "condition" | "then" | "else";
    handleSectionClick: (section: "condition" | "then" | "else") => void;
  }) => React.ReactNode;
}

/**
 * Component to manage formula sections and provide section state to children
 */
const SectionManager: React.FC<SectionManagerProps> = ({
  formula,
  isLogicTestMode,
  onFormulaUpdate,
  children
}) => {
  // Use our refactored hook for section management
  const {
    activeSection,
    handleSectionClick
  } = useFormulaSections(formula, onFormulaUpdate, isLogicTestMode);

  return <>{children({ activeSection, handleSectionClick })}</>;
};

export default SectionManager;
