
import { useState } from 'react';
import { toast } from 'sonner';
import { CalculationToken } from '@/types/calculation';

/**
 * Hook to manage the active section state in logic test mode
 */
export const useSectionState = () => {
  // Add state for active section in logic test mode
  const [activeSection, setActiveSection] = useState<"condition" | "then" | "else">("condition");

  return {
    activeSection,
    setActiveSection
  };
};
