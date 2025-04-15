
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
    // Find positions of IF, THEN, and ELSE for dividing the formula
    const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
    const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
    const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
    
    console.log(`[useSectionTokenAdder] Adding token to section: ${activeSection}`);
    console.log(`[useSectionTokenAdder] Token indices - IF: ${ifIndex}, THEN: ${thenIndex}, ELSE: ${elseIndex}`);
    
    // For calculation mode, just add to the end
    if (!isLogicTestMode) {
      const newToken = tokenGenerator();
      onAddToken(newToken);
      return;
    }
    
    // Generate the token first (we'll use it regardless of section)
    const newToken = tokenGenerator();
    
    // For logic test mode, add to the active section
    switch (activeSection) {
      case "condition":
        if (ifIndex === -1) {
          // If there's no IF yet, add it first
          toast.warning("Add an IF operator first", {
            description: "Click the IF button before adding other elements to your condition"
          });
          return;
        }
        
        // Add token directly after IF or last condition token but before THEN/ELSE
        onAddToken(newToken);
        break;
      
      case "then":
        if (thenIndex === -1) {
          // If there's no THEN yet, add it first
          console.log(`[useSectionTokenAdder] Adding THEN token first`);
          const thenLogicalToken = {
            id: `log-${Date.now()}`,
            type: "logical" as const,
            value: "then",
            display: "THEN"
          };
          onAddToken(thenLogicalToken);
          
          // Then add the actual token
          setTimeout(() => onAddToken(newToken), 10);
          return;
        }
        
        // Add token at end of formula or before ELSE if it exists
        onAddToken(newToken);
        break;
      
      case "else":
        if (elseIndex === -1) {
          // If there's no ELSE yet, add it first
          console.log(`[useSectionTokenAdder] Adding ELSE token first`);
          const elseLogicalToken = {
            id: `log-${Date.now()}`,
            type: "logical" as const,
            value: "else",
            display: "ELSE"
          };
          onAddToken(elseLogicalToken);
          
          // Then add the actual token
          setTimeout(() => onAddToken(newToken), 10);
          return;
        }
        
        // Add token at end of formula
        onAddToken(newToken);
        break;
    }
  };

  return { addTokenToFormula };
};
