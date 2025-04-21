
import React from "react";

interface SectionHeaderProps {
  label: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ label }) => {
  return <h4 className="text-sm font-medium mb-1 text-gray-600">{label}</h4>;
};
