
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

export const useFormulaTokenAdder = (
  formula: CalculationToken[],
  isLogicTestMode: boolean,
  activeSection: "condition" | "then" | "else",
  onAddToken: (token: CalculationToken) => void,
  onAddLogical: (logicalType: string) => void
) => {
  // Helper to wrap token additions with appropriate section logic
  const addTokenToFormula = (tokenGenerator: () => CalculationToken) => {
    // Find positions of IF, THEN, and ELSE for dividing the formula
    const ifIndex = formula.findIndex(token => token.type === "logical" && token.value === "if");
    const thenIndex = formula.findIndex(token => token.type === "logical" && token.value === "then");
    const elseIndex = formula.findIndex(token => token.type === "logical" && token.value === "else");
    
    // For calculation mode, just add to the end
    if (!isLogicTestMode) {
      const newToken = tokenGenerator();
      onAddToken(newToken);
      return;
    }
    
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
        
        // Generate the token
        const conditionToken = tokenGenerator();
        
        // Insert at the right position (before THEN or at the end)
        onAddToken(conditionToken);
        break;
      
      case "then":
        if (thenIndex === -1) {
          // If there's no THEN yet, add it first
          toast.warning("Add a THEN operator first", {
            description: "Click the THEN button before adding elements to your THEN section"
          });
          return;
        }
        
        // Generate the token
        const thenToken = tokenGenerator();
        
        // Insert at the right position
        onAddToken(thenToken);
        break;
      
      case "else":
        if (elseIndex === -1) {
          // If there's no ELSE yet, add it first
          toast.warning("Add an ELSE operator first", {
            description: "Click the ELSE button before adding elements to your ELSE section"
          });
          return;
        }
        
        // Generate the token and add it at the end
        const elseToken = tokenGenerator();
        onAddToken(elseToken);
        break;
    }
  };

  // Override handlers to use our section-aware logic
  const handleAddColumnWrapped = (column: any) => {
    addTokenToFormula(() => ({
      id: column.id,
      type: "column" as const,
      value: column.id,
      display: column.title
    }));
  };

  const handleAddOperatorWrapped = (operator: string) => {
    addTokenToFormula(() => ({
      id: `op-${Date.now()}`,
      type: "operator" as const,
      value: operator,
      display: operator
    }));
  };

  const handleAddNumberWrapped = () => {
    // Get user input for the number
    const numberPrompt = prompt("Enter a number:");
    
    // Only continue if the user entered a valid number
    if (numberPrompt && !isNaN(Number(numberPrompt))) {
      // Create the number token
      const numberToken = {
        id: `num-${Date.now()}`,
        type: "number" as const,
        value: numberPrompt,
        display: numberPrompt
      };
      
      // Special case for number tokens - add directly instead of using addTokenToFormula
      // This bypasses the issue with the double prompt
      if (!isLogicTestMode) {
        onAddToken(numberToken);
        return;
      }
      
      // For logic test mode, check which section is active
      switch (activeSection) {
        case "condition":
          if (formula.some(token => token.type === "logical" && token.value === "if")) {
            onAddToken(numberToken);
          } else {
            toast.warning("Add an IF operator first");
          }
          break;
          
        case "then":
          if (formula.some(token => token.type === "logical" && token.value === "then")) {
            onAddToken(numberToken);
          } else {
            toast.warning("Add a THEN operator first");
          }
          break;
          
        case "else":
          if (formula.some(token => token.type === "logical" && token.value === "else")) {
            onAddToken(numberToken);
          } else {
            toast.warning("Add an ELSE operator first");
          }
          break;
      }
    } else if (numberPrompt !== null) {
      // Show error only if user didn't cancel
      toast.error("Please enter a valid number");
    }
  };

  const handleAddConditionWrapped = (condition: string) => {
    addTokenToFormula(() => ({
      id: `cond-${Date.now()}`,
      type: "condition" as const,
      value: condition,
      display: condition
    }));
  };

  return {
    handleAddColumnWrapped,
    handleAddOperatorWrapped,
    handleAddNumberWrapped,
    handleAddConditionWrapped
  };
};
