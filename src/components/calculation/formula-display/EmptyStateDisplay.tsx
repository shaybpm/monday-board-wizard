
import React from "react";

interface EmptyStateDisplayProps {
  message: string;
  isEditing: boolean;
  disabled: boolean;
}

export const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({
  message,
  isEditing,
  disabled
}) => {
  if (isEditing) return null;
  
  return (
    <span className={`text-gray-400 ${!disabled ? 'pointer-events-none' : ''}`}>
      {message}
    </span>
  );
};
