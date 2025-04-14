
export interface Task {
  id: string;
  title: string;
  sourceBoard: string;
  destinationBoard: string;
  taskType: "calculation" | "logicTest";  // Added this field
  savedOperations?: {
    formula: Array<{
      id: string;
      type: "column" | "operator" | "number";
      value: string;
      display: string;
    }>;
    targetColumn?: {
      id: string;
      title: string;
      type: string;
    };
  };
}

// Interface for saved task templates
export interface SavedTaskTemplate {
  name: string;
  tasks: Task[];
  apiToken?: string;
  dateCreated: string;
}
