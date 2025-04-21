
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Home } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const handleDisconnect = () => {
    setIsDisconnecting(true);
    
    // Clear session storage
    setTimeout(() => {
      sessionStorage.removeItem("mondayCredentials");
      sessionStorage.removeItem("mondayBoardData");
      
      toast.success("Disconnected from Monday.com");
      navigate("/");
      setIsDisconnecting(false);
    }, 500);
  };

  return (
    <header className="bg-white border-b py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-semibold text-monday-blue hover:text-monday-darkBlue">
          Working Monday
        </Link>
        {location.pathname === '/board' && (
          <div className="hidden sm:flex space-x-2">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              <Home className="h-4 w-4 inline mr-1" /> Home
            </Link>
          </div>
        )}
      </div>
      {location.pathname === '/board' && (
        <div>
          <Button 
            variant="ghost" 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="text-gray-600 hover:text-gray-900 flex gap-2"
          >
            <LogOut className="h-4 w-4" /> Disconnect
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
