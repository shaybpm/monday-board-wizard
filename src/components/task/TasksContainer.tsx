
import React from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskTable } from "@/components/task-table/TaskTable";
import TaskActionButtons from "@/components/task/TaskActionButtons";
import TaskSessionManager from "@/components/task/TaskSessionManager";

interface TasksContainerProps {
  setIsApiDialogOpen: (isOpen: boolean) => void;
}

const TasksContainer: React.FC<TasksContainerProps> = ({ setIsApiDialogOpen }) => {
  const { 
    tasks, 
    selectedTaskId, 
    apiToken, 
    updateTask, 
    addTask, 
    removeTask, 
    selectTask 
  } = useTaskContext();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Handle session storage cleanup */}
      <TaskSessionManager />
      
      <h1 className="text-2xl font-bold mb-6 text-center text-monday-blue">
        Monday.com Board Tasks
      </h1>
      
      <TaskTable 
        tasks={tasks} 
        updateTask={updateTask} 
        addTask={addTask}
        removeTask={removeTask}
        selectedTaskId={selectedTaskId}
        onSelectTask={selectTask}
      />
      
      <TaskActionButtons
        selectedTaskId={selectedTaskId}
        tasks={tasks}
        apiToken={apiToken}
        setIsApiDialogOpen={setIsApiDialogOpen}
      />
    </div>
  );
};

export default TasksContainer;
