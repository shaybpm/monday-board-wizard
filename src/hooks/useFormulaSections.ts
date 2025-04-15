
import { useState, useEffect } from 'react';
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

export const useFormulaSections = (
  formula: CalculationToken[], 
  onFormulaUpdate: (newFormula: CalculationToken[]) => void,
  isLogicTestMode: boolean = false // This is now fixed based on task type
) => {
  // Store separate formulas for each mode
  const [calculationFormula, setCalculationFormula] = useState<CalculationToken[]>([]);
  const [logicTestFormula, setLogicTestFormula] = useState<CalculationToken[]>([]);
  
  // Add state for active section in logic test mode
  const [activeSection, setActiveSection] = useState<"condition" | "then" | "else">("condition");

  // Initialize the appropriate formula arrays when component mounts or mode changes
  useEffect(() => {
    if (formula.length > 0) {
      if (isLogicTestMode) {
        // Store in logic test formula state
        setLogicTestFormula(formula);
      } else {
        // Store in calculation formula state
        setCalculationFormula(formula);
      }
    }
    
    // Log for debugging
    console.log("useFormulaSections - Is logic test mode:", isLogicTestMode);
    console.log("useFormulaSections - Formula:", formula);
  }, [formula, isLogicTestMode]);
  
  // When component first loads, load any saved formulas based on mode
  useEffect(() => {
    if (isLogicTestMode) {
      if (logicTestFormula.length > 0) {
        onFormulaUpdate(logicTestFormula);
      } else if (formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value))) {
        // If formula has logical tokens, store it in logic test formula
        setLogicTestFormula(formula);
      }
    } else {
      if (calculationFormula.length > 0) {
        onFormulaUpdate(calculationFormula);
      } else if (!formula.some(token => token.type === "logical" && ["if", "then", "else"].includes(token.value))) {
        // If formula doesn't have logical tokens, store it in calculation formula
        setCalculationFormula(formula);
      }
    }
  }, [isLogicTestMode]);

  // When a formula section is clicked, set it as active
  const handleSectionClick = (section: "condition" | "then" | "else") => {
    if (!isLogicTestMode) return; // Only allow section switching in logic test mode
    
    console.log(`[useFormulaSections] Section clicked: ${section}, current active section: ${activeSection}`);
    
    // Only update if the section is different
    if (section !== activeSection) {
      setActiveSection(section);
      
      console.log(`[useFormulaSections] Setting active section to: ${section}`);
      
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
        
        console.log(`[useFormulaSections] Adding THEN token because it's missing`);
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
          console.log(`[useFormulaSections] Adding ELSE token because it's missing`);
          onFormulaUpdate([...formula, elseToken]);
        } else {
          // If no THEN token, warn user
          console.log(`[useFormulaSections] Cannot add ELSE without THEN section`);
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
        console.log(`[useFormulaSections] Adding IF token because it's missing`);
        onFormulaUpdate([ifToken]);
      }
    }
  };

  return {
    isLogicTestMode,
    activeSection,
    handleSectionClick,
    calculationFormula,
    logicTestFormula
  };
};
