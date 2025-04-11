
import { Task, SavedTaskTemplate } from "@/types/task";

export interface TaskContextProps {
  tasks: Task[];
  selectedTaskId: string | null;
  apiToken: string;
  currentTemplate: SavedTaskTemplate | null;
  saveTemplateName: string;
  savedTemplates: SavedTaskTemplate[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setApiToken: React.Dispatch<React.SetStateAction<string>>;
  setCurrentTemplate: React.Dispatch<React.SetStateAction<SavedTaskTemplate | null>>;
  setSaveTemplateName: React.Dispatch<React.SetStateAction<string>>;
  setSavedTemplates: React.Dispatch<React.SetStateAction<SavedTaskTemplate[]>>;
  addTask: () => void;
  updateTask: (id: string, field: keyof Task, value: string) => void;
  removeTask: (id: string) => void;
  selectTask: (id: string) => void;
  saveTasksAsTemplate: () => void;
  loadTemplate: (template: SavedTaskTemplate) => void;
  deleteTemplate: (index: number) => void;
}
