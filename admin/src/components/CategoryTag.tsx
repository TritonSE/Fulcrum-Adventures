import React from "react";
// Import your CSS file here, e.g., import "./Tags.css";

export type CategoryType =
  | "Opener"
  | "Icebreaker"
  | "Active"
  | "Connection"
  | "Debrief"
  | "Team Challenge";

interface CategoryTagProps {
  category: CategoryType;
  selected?: boolean;
  onClick?: (category: CategoryType) => void;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  selected = false,
  onClick,
}) => {
  const formattedCategory = category.toLowerCase().replace(" ", "-");

  const classes = [
    "tag",
    "tag-category",
    `tag-category--${formattedCategory}`,
    selected && "tag-category--selected",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onClick && onClick(category)}
    >
      {category}
    </button>
  );
};
