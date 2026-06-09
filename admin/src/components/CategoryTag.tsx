import React from "react";
import "./Tags.css";
import { type Category } from "../types/activity.ts";
import { CATEGORY_COLORS } from "../constants/activityColors.ts";

interface CategoryTagProps {
  category: Category;
  selected?: boolean;
  onClick?: (category: Category) => void;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  selected = false,
  onClick,
}) => {
  if (!category) {
    return null;
  }
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
      style={{
        color: selected ? undefined : CATEGORY_COLORS[category],
        backgroundColor: selected ? CATEGORY_COLORS[category] : undefined,
      }}
    >
      {category}
    </button>
  );
};
