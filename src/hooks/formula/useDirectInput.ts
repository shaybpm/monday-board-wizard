
import { useState } from 'react';

export const useDirectInput = () => {
  // Add a handler for direct text input
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
