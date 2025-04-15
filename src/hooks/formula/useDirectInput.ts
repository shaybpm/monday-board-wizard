
import { useState } from 'react';

/**
 * Hook for handling direct text input in formula sections
 */
export const useDirectInput = () => {
  // Handler for direct text input
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
