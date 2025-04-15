
import { useState, useEffect } from "react";
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
import { Task } from "@/types/task";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Load current task on component mount and when location changes
  useEffect(() => {
    const taskData = sessionStorage.getItem("mondayCurrentTask");
    if (taskData) {
      try {
        const task = JSON.parse(taskData);
        setCurrentTask(task);
      } catch (e) {
        console.error("Error parsing task data:", e);
        setCurrentTask(null);
      }
    } else {
      setCurrentTask(null);
    }
  }, [location.pathname]);
  
  // Determine which paths should be enabled based on task configuration
  const getBreadcrumbState = () => {
    // Always check if we have task data first
    const taskData = sessionStorage.getItem("mondayCurrentTask");
    if (!taskData) {
      return {
        operationEnabled: false,
        boardEnabled: false
      };
    }
    
    try {
      const currentTask = JSON.parse(taskData) as Task;
      
      // Board page is enabled if we have a current task
      const boardEnabled = true;
      
      // Operation page is enabled if board was configured or has selected columns
      const operationEnabled = 
        currentTask.boardConfigured === true || 
        (currentTask.selectedColumns && currentTask.selectedColumns.length > 0) ||
        !!currentTask.savedOperations;
      
      return {
        operationEnabled,
        boardEnabled
      };
    } catch (e) {
      console.error("Error parsing task data for navigation:", e);
      return {
        operationEnabled: false,
        boardEnabled: false
      };
    }
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
        
        <div className="flex items-center gap-4">
          {currentTask && (
            <div className="text-sm font-medium text-blue-700 hidden sm:block">
              Task {currentTask.id}: {currentTask.title}
            </div>
          )}
          
          {location.pathname === '/board' || location.pathname === '/operation' ? (
            <Button 
              variant="ghost" 
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-gray-600 hover:text-gray-900 flex gap-2"
            >
              <LogOut className="h-4 w-4" /> Disconnect
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
