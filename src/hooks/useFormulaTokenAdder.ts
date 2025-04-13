
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

// Global flag to prevent multiple simultaneous number input processes
let isGlobalNumberInputActive = false;

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
    // Check global flag to prevent multiple simultaneous calls
    if (isGlobalNumberInputActive) {
      console.log("[Number Input] BLOCKED: Another number input is already active");
      return;
    }
    
    // Set global flag to prevent multiple simultaneous processes
    isGlobalNumberInputActive = true;
    console.log("[Number Input] Starting number input flow - GLOBAL FLAG SET");
    
    try {
      // Make the number input module async with a Promise
      setTimeout(() => {
        try {
          // Get user input for the number with a delay to ensure UI is ready
          const numberPrompt = prompt("Enter a number:");
          console.log(`[Number Input] User entered: "${numberPrompt}"`);
          
          // Only continue if the user entered a valid number
          if (numberPrompt && !isNaN(Number(numberPrompt))) {
            console.log(`[Number Input] Valid number input: ${numberPrompt}`);
            
            // Create the number token
            const numberToken = {
              id: `num-${Date.now()}`,
              type: "number" as const,
              value: numberPrompt,
              display: numberPrompt
            };
            console.log("[Number Input] Token created:", numberToken);
            
            // For regular calculation mode, add directly
            if (!isLogicTestMode) {
              console.log("[Number Input] Adding in calculation mode");
              onAddToken(numberToken);
            } else {
              // For logic test mode, check which section is active
              console.log(`[Number Input] Logic test mode, active section: ${activeSection}`);
              switch (activeSection) {
                case "condition":
                  if (formula.some(token => token.type === "logical" && token.value === "if")) {
                    console.log("[Number Input] Adding to condition section");
                    onAddToken(numberToken);
                  } else {
                    console.log("[Number Input] Error: No IF operator found");
                    toast.warning("Add an IF operator first");
                  }
                  break;
                  
                case "then":
                  if (formula.some(token => token.type === "logical" && token.value === "then")) {
                    console.log("[Number Input] Adding to THEN section");
                    onAddToken(numberToken);
                  } else {
                    console.log("[Number Input] Error: No THEN operator found");
                    toast.warning("Add a THEN operator first");
                  }
                  break;
                  
                case "else":
                  if (formula.some(token => token.type === "logical" && token.value === "else")) {
                    console.log("[Number Input] Adding to ELSE section");
                    onAddToken(numberToken);
                  } else {
                    console.log("[Number Input] Error: No ELSE operator found");
                    toast.warning("Add an ELSE operator first");
                  }
                  break;
              }
            }
          } else if (numberPrompt !== null) {
            // Show error only if user didn't cancel
            console.log("[Number Input] Invalid number input");
            toast.error("Please enter a valid number");
          } else {
            console.log("[Number Input] User cancelled input");
          }
        } finally {
          // Reset the global flag after a delay
          setTimeout(() => {
            console.log("[Number Input] Reset global flag");
            isGlobalNumberInputActive = false;
          }, 500);
        }
      }, 100); // Add small delay before showing prompt
    } catch (error) {
      console.error("[Number Input] Error in number input process:", error);
      // Make sure flag is reset even if there's an error
      isGlobalNumberInputActive = false;
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
