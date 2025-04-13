
// A simple hook to manage the global number input state
// This prevents multiple simultaneous number input processes

let isGlobalNumberInputActive = false;

export const useNumberInputState = () => {
  const setNumberInputActive = () => {
    isGlobalNumberInputActive = true;
    console.log("[Number Input] Starting number input flow - GLOBAL FLAG SET to TRUE");
    return isGlobalNumberInputActive;
  };

  const setNumberInputInactive = () => {
    isGlobalNumberInputActive = false;
    console.log("[Number Input] Reset global flag to FALSE");
    return isGlobalNumberInputActive;
  };

  const isNumberInputActive = () => {
    console.log("[Number Input] Checking flag status:", isGlobalNumberInputActive);
    return isGlobalNumberInputActive;
  };

  return {
    isNumberInputActive,
    setNumberInputActive,
    setNumberInputInactive
  };
};
