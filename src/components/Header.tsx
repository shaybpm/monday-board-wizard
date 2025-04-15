
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Home, ChevronRight } from "lucide-react";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  // Check if we have a current task with saved operations
  const hasTaskWithSavedOperations = () => {
    const currentTaskData = sessionStorage.getItem("mondayCurrentTask");
    if (currentTaskData) {
      try {
        const currentTask = JSON.parse(currentTaskData);
        return !!currentTask.savedOperations;
      } catch (e) {
        return false;
      }
    }
    return false;
  };
  
  // Determine which paths should be enabled based on task configuration
  const getBreadcrumbState = () => {
    // Operation page should only be enabled if columns were selected or operations are saved
    const operationEnabled = location.pathname === '/operation' || 
                            sessionStorage.getItem("selectedColumns") ||
                            hasTaskWithSavedOperations();
                            
    // Board page should be enabled if we're on board or operation page,
    // or if we have a current task
    const boardEnabled = location.pathname === '/board' || 
                         location.pathname === '/operation' ||
                         sessionStorage.getItem("mondayCurrentTask");
                         
    return {
      operationEnabled,
      boardEnabled
    };
  };
  
  const { operationEnabled, boardEnabled } = getBreadcrumbState();

  // Determine active state and styling for breadcrumb items
  const getItemStyle = (path: string) => {
    const isActive = location.pathname === path;
    
    return isActive ? 
      "font-bold text-primary" :
      "text-muted-foreground hover:text-primary transition-colors";
  };

  const handleDisconnect = () => {
    setIsDisconnecting(true);
    
    // Clear session storage
    setTimeout(() => {
      sessionStorage.removeItem("mondayCredentials");
      sessionStorage.removeItem("mondayBoardData");
      sessionStorage.removeItem("mondayCurrentTask");
      sessionStorage.removeItem("selectedColumns");
      
      toast.success("Disconnected from Monday.com");
      navigate("/");
      setIsDisconnecting(false);
    }, 500);
  };

  return (
    <header className="bg-white border-b py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link 
                    to="/" 
                    className={`text-lg font-semibold ${getItemStyle('/')} transition-colors`}
                  >
                    Working Monday
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              {(boardEnabled || location.pathname === '/board') && (
                <>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      asChild
                      className={boardEnabled ? getItemStyle('/board') : "pointer-events-none opacity-50"}
                    >
                      <Link to="/board" className="text-sm">
                        Board Setup
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              
              {(operationEnabled || location.pathname === '/operation') && (
                <>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      asChild
                      className={operationEnabled ? getItemStyle('/operation') : "pointer-events-none opacity-50"}
                    >
                      <Link to="/operation" className="text-sm">
                        Operation Builder
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {location.pathname === '/board' || location.pathname === '/operation' ? (
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
        ) : null}
      </div>
    </header>
  );
};

export default Header;
