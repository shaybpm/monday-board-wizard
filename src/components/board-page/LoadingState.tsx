
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LoadingStateProps {
  error?: string | null;
  onRetry?: () => void;
}

const LoadingState = ({ error, onRetry }: LoadingStateProps) => {
  const navigate = useNavigate();
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-red-600 mb-2">Loading Error</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="border-blue-300 hover:bg-blue-50"
              >
                Retry Loading
              </Button>
            )}
            <Button 
              onClick={() => navigate("/")}
              variant="default"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-monday-blue" />
        <p className="mt-4 text-lg text-gray-600">Loading board data...</p>
      </div>
    </div>
  );
};

export default LoadingState;
