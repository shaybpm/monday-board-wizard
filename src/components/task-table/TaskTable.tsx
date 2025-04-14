
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskTableProps {
  tasks: Task[];
  updateTask: (id: string, field: keyof Task, value: string) => void;
  addTask: () => void;
  removeTask: (id: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks, 
  updateTask, 
  addTask,
  removeTask,
  selectedTaskId,
  onSelectTask
}) => {
  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-16">No.</TableHead>
            <TableHead>Task Title</TableHead>
            <TableHead>Source Board</TableHead>
            <TableHead>Destination Board</TableHead>
            <TableHead>Task Type</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="px-2">
                <Checkbox 
                  checked={selectedTaskId === task.id}
                  onCheckedChange={() => onSelectTask(task.id)} 
                  aria-label={`Select task ${task.id}`}
                />
              </TableCell>
              <TableCell className="font-medium">{task.id}</TableCell>
              <TableCell>
                <Input
                  value={task.title}
                  onChange={(e) => updateTask(task.id, "title", e.target.value)}
                  placeholder="Enter task description"
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={task.sourceBoard}
                  onChange={(e) => updateTask(task.id, "sourceBoard", e.target.value)}
                  placeholder="Enter source board ID"
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={task.destinationBoard}
                  onChange={(e) => updateTask(task.id, "destinationBoard", e.target.value)}
                  placeholder="Optional - same as source if empty"
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={task.taskType || "calculation"}
                  onValueChange={(value) => updateTask(task.id, "taskType", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calculation">Calculation</SelectItem>
                    <SelectItem value="logicTest">Logic Test</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTask(task.id)}
                  className="hover:bg-red-100 hover:text-red-600"
                >
                  <span className="i-lucide-trash-2 w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-2 border-t flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={addTask}
          className="flex items-center gap-1"
        >
          <span className="i-lucide-plus w-4 h-4" /> Add Task
        </Button>
      </div>
    </div>
  );
};
