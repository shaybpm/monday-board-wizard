
// Global state for number input to prevent multiple dialogs
let isNumberInputActiveGlobal = false;

export const useNumberInputState = () => {
  const isNumberInputActive = () => {
    return isNumberInputActiveGlobal;
  };
  
  const setNumberInputActive = () => {
    isNumberInputActiveGlobal = true;
    console.log("[NumberInputState] Set active");
  };
  
  const setNumberInputInactive = () => {
    isNumberInputActiveGlobal = false;
    console.log("[NumberInputState] Set inactive");
  };
  
  return {
    isNumberInputActive,
    setNumberInputActive,
    setNumberInputInactive
  };
};
