
import React from "react";
import { Task } from "@/types/task";

interface TaskSummaryProps {
  task: Task | null;
  boardName?: string;
}

const TaskSummary: React.FC<TaskSummaryProps> = ({ task, boardName }) => {
  if (!task) return null;
  
  return (
    <div className="bg-blue-50 p-3 rounded-md mb-4 text-blue-800 text-sm">
      <div className="flex flex-wrap gap-2">
        <span className="font-semibold">Task {task.id}:</span>
        <span>{task.title}</span>
        <span>-</span>
        <span>Source Board: {boardName || 'Loading...'} ({task.sourceBoard})</span>
      </div>
    </div>
  );
};

export default TaskSummary;
