
import React from "react";

interface SectionWrapperProps {
  className: string;
  disabled: boolean;
  onClick: () => void;
  hasClickHandler: boolean;
  isEmpty: boolean;
  isEditing: boolean;
  sectionType: "condition" | "then" | "else";
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  className,
  disabled,
  onClick,
  hasClickHandler,
  isEmpty,
  isEditing,
  sectionType,
  children
}) => {
  return (
    <div 
      className={`p-4 border rounded-md ${className} min-h-16 flex flex-wrap gap-2 items-center 
        ${disabled ? 'opacity-60' : ''} 
        ${hasClickHandler && !disabled ? 'cursor-pointer hover:bg-opacity-90 transition-all' : ''}
        ${hasClickHandler && !disabled && isEmpty && !isEditing ? 'animate-pulse' : ''}
      `}
      aria-disabled={disabled}
      onClick={onClick}
      role={hasClickHandler && !disabled ? "button" : undefined}
      data-section={sectionType}
    >
      {children}
    </div>
  );
};
