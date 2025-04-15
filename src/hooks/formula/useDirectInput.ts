
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
    // Log the input for debugging
    console.log(`[useDirectInput] Direct input: ${text} for section ${section}`);
    
    // Return the text and section for processing in the calling component
    return {
      text,
      section
    };
  };

  return {
    handleAddDirectInput
  };
};
