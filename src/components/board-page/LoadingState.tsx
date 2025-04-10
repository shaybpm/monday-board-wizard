
import { Loader2 } from "lucide-react";

const LoadingState = () => {
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
