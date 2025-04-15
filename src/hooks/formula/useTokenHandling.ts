
import { CalculationToken } from '@/types/calculation';

export interface TokenHandlingProps {
  isLogicTestMode: boolean;
  activeSection: "condition" | "then" | "else";
  onAddToken: (token: CalculationToken) => void;
}

export const useTokenHandling = ({
  isLogicTestMode,
  activeSection,
  onAddToken
}: TokenHandlingProps) => {
  // Handler for adding columns with section awareness
  const handleAddColumnWrapped = (column: any) => {
    console.log(`[useTokenHandling] Adding column ${column.id} to ${isLogicTestMode ? activeSection : "formula"} section`);
    
    try {
      // In calculation mode, add directly to formula regardless of section
      if (!isLogicTestMode) {
        console.log("[TokenHandler] Adding column directly in calculation mode:", column);
        onAddToken({
          id: column.id,
          type: "column" as const,
          value: column.id,
          display: column.title
        });
        return;
      }
      
      // In logic test mode, use the section-aware handler
      onAddToken({
        id: column.id,
        type: "column" as const,
        value: column.id,
        display: column.title
      });
    } catch (err) {
      console.error("[useTokenHandling] Error adding column:", err);
    }
  };

  return {
    handleAddColumnWrapped
  };
};
