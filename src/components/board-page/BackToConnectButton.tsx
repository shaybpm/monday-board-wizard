
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackToConnectButton = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6">
      <Button
        variant="outline"
        onClick={() => navigate("/")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
    </div>
  );
};

export default BackToConnectButton;
