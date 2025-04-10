
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-600 mb-4">
          There was a problem loading your board data.
        </p>
        <Button 
          onClick={() => navigate('/')}
          variant="destructive"
        >
          Return to Connect Page
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
