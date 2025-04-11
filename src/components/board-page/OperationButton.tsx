
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OperationButtonProps {
  disabled: boolean;
  selectedColumns?: string[];
}

const OperationButton: React.FC<OperationButtonProps> = ({ disabled, selectedColumns = [] }) => {
  const navigate = useNavigate();

  const handleOperation = () => {
    // Store the selected columns in session storage for use in the calculation builder
    sessionStorage.setItem("selectedColumns", JSON.stringify(selectedColumns));
    // Navigate to the operation page
    navigate("/operation");
  };

  return (
    <div className="mt-4">
      <Button
        className="w-full"
        size="lg"
        disabled={disabled}
        onClick={handleOperation}
      >
        <Calculator className="mr-2 h-5 w-5" />
        Continue to Operation Builder
      </Button>
    </div>
  );
};

export default OperationButton;
