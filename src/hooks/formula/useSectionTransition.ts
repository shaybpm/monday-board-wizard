
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

/**
 * Hook to handle section transitions and section-specific logic
 */
export const useSectionTransition = (
  formula: CalculationToken[],
  onFormulaUpdate: (newFormula: CalculationToken[]) => void
) => {
  // When a formula section is clicked, set it as active
  const handleSectionClick = (
    section: "condition" | "then" | "else", 
    activeSection: "condition" | "then" | "else",
    setActiveSection: (section: "condition" | "then" | "else") => void
  ) => {
    console.log(`[useSectionTransition] Section clicked: ${section}, current active section: ${activeSection}`);
    
    // Only update if the section is different
    if (section !== activeSection) {
      setActiveSection(section);
      console.log(`[useSectionTransition] Setting active section to: ${section}`);
      
      // Show visual feedback with the appropriate color
      const colorMap = {
        condition: {text: "blue", title: "IF Condition"},
        then: {text: "green", title: "THEN Section"},
        else: {text: "red", title: "ELSE Section"}
      };
      
      const { text, title } = colorMap[section];
      
      // Add the logical token if not present
      if (section === "then" && !formula.some(token => token.type === "logical" && token.value === "then")) {
        // Add THEN token if missing
        const thenToken = {
          id: `log-${Date.now()}`,
          type: "logical" as const,
          value: "then",
          display: "THEN"
        };
        
        console.log(`[useSectionTransition] Adding THEN token because it's missing`);
        onFormulaUpdate([...formula, thenToken]);
      } else if (section === "else" && !formula.some(token => token.type === "logical" && token.value === "else")) {
        // Add ELSE token if missing
        const elseToken = {
          id: `log-${Date.now()}`,
          type: "logical" as const,
          value: "else",
          display: "ELSE"
        };
        
        const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
        if (thenIndex > -1) {
          // Add after the last THEN token
          console.log(`[useSectionTransition] Adding ELSE token because it's missing`);
          onFormulaUpdate([...formula, elseToken]);
        } else {
          // If no THEN token, warn user
          console.log(`[useSectionTransition] Cannot add ELSE without THEN section`);
          toast.info("You need to add a THEN section first");
          setActiveSection("then");
          return;
        }
      } else if (section === "condition" && !formula.some(token => token.type === "logical" && token.value === "if")) {
        // Add IF token if missing
        const ifToken = {
          id: `log-${Date.now()}`,
          type: "logical" as const,
          value: "if",
          display: "IF"
        };
        console.log(`[useSectionTransition] Adding IF token because it's missing`);
        onFormulaUpdate([ifToken]);
      }
    }
  };

  return { handleSectionClick };
};
