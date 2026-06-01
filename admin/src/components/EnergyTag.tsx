import React from "react";
import "./Tags.css";
import LightningIcon from "../../icons/lightning.svg";

type EnergyLevel = 1 | 2 | 3;

interface EnergyTagProps {
  level: EnergyLevel;
  selected?: boolean;
  onClick?: (level: EnergyLevel) => void;
}

export const EnergyTag: React.FC<EnergyTagProps> = ({
  level,
  selected,
  onClick,
}) => {
  const labels = { 1: "Low", 2: "Medium", 3: "High" };

  return (
    <div
      className={`tag tag-energy ${selected ? "tag-energy--selected" : ""}`}
      aria-label={`Energy level: ${labels[level]}`}
      onClick={() => onClick?.(level)}
    >
      <span className="energy-icon-wrapper">
        {Array.from({ length: 3 }).map((_, index) => (
          <img
            key={index}
            src={LightningIcon}
            alt=""
            aria-hidden="true"
            className={`energy-icon ${index < level ? "energy-icon--active" : "energy-icon--inactive"}`}
          />
        ))}
      </span>
    </div>
  );
};
