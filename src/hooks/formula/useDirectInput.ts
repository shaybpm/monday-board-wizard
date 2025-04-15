
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
    
    if (!text.trim()) {
      console.log('[useDirectInput] Empty input, ignoring');
      return { text: '', section };
    }
    
    // CRITICAL FIX: Return an object with the specific section to ensure proper placement
    return {
      text,
      section // This must be passed through the entire chain
    };
  };

  return {
    handleAddDirectInput
  };
};
