import React from "react";
import "./Tags.css";

interface SmallTagProps {
  label: string;
  value: string | number;
  selected?: boolean;
  onChange?: (value: string | number) => void;
}

export const SmallTag: React.FC<SmallTagProps> = ({
  label,
  value,
  selected = false,
  onChange,
}) => {
  return (
    <button
      type="button"
      className={`tag tag-small ${selected ? "tag-small--selected" : ""}`}
      onClick={() => onChange?.(value)}
    >
      {label}
    </button>
  );
};
