
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
  // Find positions of IF, THEN, and ELSE for dividing the formula
  const getLogicalIndices = () => {
    const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
    const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
    const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
    
    return { ifIndex, thenIndex, elseIndex };
  };

  // Helper to wrap token additions with appropriate section logic
  const addTokenToFormula = (tokenGenerator: () => CalculationToken) => {
    // For calculation mode, just add to the end
    if (!isLogicTestMode) {
      const newToken = tokenGenerator();
      console.log("[Section Token Adder] Adding token in calculation mode:", newToken);
      onAddToken(newToken);
      return;
    }
    
    // For logic test mode, add to the active section
    const { ifIndex, thenIndex, elseIndex } = getLogicalIndices();
    console.log(`[Section Token Adder] Logical indices: if=${ifIndex}, then=${thenIndex}, else=${elseIndex}`);
    
    switch (activeSection) {
      case "condition":
        if (ifIndex === -1) {
          // If there's no IF yet, add it first
          console.log("[Section Token Adder] No IF found for condition section");
          toast.warning("Add an IF operator first", {
            description: "Click the IF button before adding other elements to your condition"
          });
          return;
        }
        
        // Generate the token
        const conditionToken = tokenGenerator();
        console.log("[Section Token Adder] Adding token to condition section:", conditionToken);
        
        // Insert at the right position (before THEN or at the end)
        onAddToken(conditionToken);
        break;
      
      case "then":
        if (thenIndex === -1) {
          // If there's no THEN yet, add it first
          console.log("[Section Token Adder] No THEN found for then section");
          toast.warning("Add a THEN operator first", {
            description: "Click the THEN button before adding elements to your THEN section"
          });
          return;
        }
        
        // Generate the token
        const thenToken = tokenGenerator();
        console.log("[Section Token Adder] Adding token to then section:", thenToken);
        
        // Insert at the right position
        onAddToken(thenToken);
        break;
      
      case "else":
        if (elseIndex === -1) {
          // If there's no ELSE yet, add it first
          console.log("[Section Token Adder] No ELSE found for else section");
          toast.warning("Add an ELSE operator first", {
            description: "Click the ELSE button before adding elements to your ELSE section"
          });
          return;
        }
        
        // Generate the token and add it at the end
        const elseToken = tokenGenerator();
        console.log("[Section Token Adder] Adding token to else section:", elseToken);
        onAddToken(elseToken);
        break;
    }
  };

  return {
    addTokenToFormula
  };
};
