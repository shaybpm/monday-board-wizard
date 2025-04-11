
import { useState } from "react";
import { TaskProvider } from "@/contexts/TaskContext";
import Image from "@/components/ui/image";
import ApiTokenDialog from "@/components/ApiTokenDialog";
import TasksContainer from "@/components/task/TasksContainer";
import SaveTemplateDialog from "@/components/task/SaveTemplateDialog";
import HeaderActions from "@/components/task/HeaderActions";

const Index = () => {
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  return (
    <TaskProvider>
      <div className="min-h-screen relative bg-gray-50 p-4">
        <div className="absolute top-4 left-4">
          <Image 
            src="/lovable-uploads/a0e5aded-ac26-4982-99b0-c8dc02aea0af.png" 
            alt="BIM Project Management Logo" 
            className="h-16 w-auto"
          />
        </div>
        
        <div className="absolute top-4 right-4">
          <HeaderActions 
            onOpenApiDialog={() => setIsApiDialogOpen(true)}
            onOpenSaveDialog={() => setIsSaveDialogOpen(true)}
          />
        </div>
        
        <div className="pt-24 max-w-4xl mx-auto">
          <TasksContainer setIsApiDialogOpen={setIsApiDialogOpen} />
        </div>
        
        <SaveTemplateDialog 
          isOpen={isSaveDialogOpen} 
          onClose={() => setIsSaveDialogOpen(false)}
        />
        
        <ApiTokenDialog
          open={isApiDialogOpen}
          onOpenChange={setIsApiDialogOpen}
          apiToken={useTaskContext().apiToken}
          setApiToken={useTaskContext().setApiToken}
        />
      </div>
    </TaskProvider>
  );
};

export default Index;
