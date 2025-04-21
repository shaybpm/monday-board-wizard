
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

export interface SectionTokenAdderProps {
  formula: CalculationToken[];
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  onAddToken: (token: CalculationToken) => void;
}

export const useSectionTokenAdder = ({
  formula,
  isLogicTestMode,
  activeSection,
  onAddToken
}: SectionTokenAdderProps) => {
  // Helper to add tokens to the correct section based on active section
  const addTokenToFormula = (tokenGenerator: () => CalculationToken) => {
    try {
      // Generate the token first (we'll use it regardless of section)
      const newToken = tokenGenerator();
      console.log(`[useSectionTokenAdder] Generated token: ${JSON.stringify(newToken)}`);
      
      // For calculation mode, just add to the end
      if (!isLogicTestMode) {
        console.log('[useSectionTokenAdder] Adding to calculation formula');
        onAddToken(newToken);
        return;
      }
      
      // Find positions of IF, THEN, and ELSE for dividing the formula
      const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
      const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
      const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
      
      console.log(`[useSectionTokenAdder] Adding token to section: ${activeSection}`);
      console.log(`[useSectionTokenAdder] Token indices - IF: ${ifIndex}, THEN: ${thenIndex}, ELSE: ${elseIndex}`);
      
      // For logic test mode, add to the active section
      switch (activeSection) {
        case "condition":
          if (ifIndex === -1) {
            toast.warning("Add an IF operator first");
            return;
          }
          console.log('[useSectionTokenAdder] Adding to condition section');
          onAddToken(newToken);
          break;
        
        case "then":
          if (thenIndex === -1) {
            toast.warning("Add a THEN operator first");
            return;
          }
          console.log('[useSectionTokenAdder] Adding to THEN section');
          onAddToken(newToken);
          break;
        
        case "else":
          if (elseIndex === -1) {
            toast.warning("Add an ELSE operator first");
            return;
          }
          console.log('[useSectionTokenAdder] Adding to ELSE section');
          onAddToken(newToken);
          break;
      }
    } catch (err) {
      console.error('[useSectionTokenAdder] Error adding token:', err);
      toast.error("Failed to add token");
    }
  };

  return { addTokenToFormula };
};
