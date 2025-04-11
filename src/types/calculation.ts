
import { BoardColumn } from "@/lib/types";

export interface CalculationToken {
  id: string;
  type: "column" | "operator" | "number";
  value: string;
  display: string;
}

export interface CalculationFormState {
  formula: CalculationToken[];
  targetColumn: BoardColumn | null;
}
