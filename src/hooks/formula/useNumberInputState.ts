
// A simple hook to manage the global number input state
// This prevents multiple simultaneous number input processes

let isGlobalNumberInputActive = false;

export const useNumberInputState = () => {
  const setNumberInputActive = () => {
    isGlobalNumberInputActive = true;
    console.log("[Number Input] Starting number input flow - GLOBAL FLAG SET");
  };

  const setNumberInputInactive = () => {
    isGlobalNumberInputActive = false;
    console.log("[Number Input] Reset global flag");
  };

  const isNumberInputActive = () => isGlobalNumberInputActive;

  return {
    isNumberInputActive,
    setNumberInputActive,
    setNumberInputInactive
  };
};
