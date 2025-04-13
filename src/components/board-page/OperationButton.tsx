
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { Link } from "react-router-dom";

interface OperationButtonProps {
  disabled: boolean;
  selectedColumns?: string[];
}

const OperationButton: React.FC<OperationButtonProps> = ({ disabled, selectedColumns = [] }) => {
  const handleOperation = () => {
    // Store the selected columns in session storage for use in the calculation builder
    sessionStorage.setItem("selectedColumns", JSON.stringify(selectedColumns));
  };

  return (
    <div className="mt-4">
      <Button
        className="w-full"
        size="lg"
        disabled={disabled}
        onClick={handleOperation}
        asChild
      >
        <Link to="/operation">
          <Calculator className="mr-2 h-5 w-5" />
          Continue to Operation Builder
        </Link>
      </Button>
    </div>
  );
};

export default OperationButton;
