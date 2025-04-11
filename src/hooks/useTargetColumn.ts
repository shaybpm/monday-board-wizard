
import { useState } from 'react';
import { BoardColumn } from '@/lib/types';

/**
 * Hook for managing the target column selection
 */
export const useTargetColumn = () => {
  const [targetColumn, setTargetColumn] = useState<BoardColumn | null>(null);
  
  const handleSetTarget = (column: BoardColumn) => {
    setTargetColumn(column);
  };

  const isTargetValid = () => {
    return targetColumn !== null;
  };
  
  return {
    targetColumn,
    setTargetColumn,
    handleSetTarget,
    isTargetValid
  };
};
