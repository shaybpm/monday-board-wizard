
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

/**
 * Hook to validate if a section exists in the formula
 */
export const useSectionValidation = (formula: CalculationToken[]) => {
  // Check if a logical operator exists in the formula
  const hasLogicalOperator = (operator: string): boolean => {
    return formula.some(token => token.type === "logical" && token.value === operator);
  };

  // Validate that the required section operator exists
  const validateSection = (section: "condition" | "then" | "else"): boolean => {
    switch (section) {
      case "condition":
        if (hasLogicalOperator("if")) {
          return true;
        } else {
          toast.warning("Add an IF operator first");
          return false;
        }
      
      case "then":
        if (hasLogicalOperator("then")) {
          return true;
        } else {
          toast.warning("Add a THEN operator first");
          return false;
        }
      
      case "else":
        if (hasLogicalOperator("else")) {
          return true;
        } else {
          toast.warning("Add an ELSE operator first");
          return false;
        }
    }
  };

  return {
    validateSection,
    hasLogicalOperator
  };
};
