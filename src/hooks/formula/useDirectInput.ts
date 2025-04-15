
import { useState } from 'react';
import { useSectionValidation } from './useSectionValidation';
import { CalculationToken } from '@/types/calculation';
import { toast } from 'sonner';

/**
 * Hook for handling direct text input in formula sections
 */
export const useDirectInput = () => {
  // Handler for direct text input that ensures it's added to the correct section
  const handleAddDirectInput = (text: string, section: "condition" | "then" | "else") => {
    // Enhanced logging with section information
    console.log(`[useDirectInput] Processing direct input: "${text}" for section "${section}"`);
    
    // IMPORTANT: We must return both the text AND the specific section to ensure
    // the text is added to the correct section
    return {
      text,
      section: section // Explicitly use the passed section parameter
    };
  };

  return {
    handleAddDirectInput
  };
};
