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
      onClick={() => onClick?.(level)}
    >
      <span className="energy-icon-wrapper">
        {Array.from({ length: level }).map((_, index) => (
          <img
            key={index}
            src={LightningIcon}
            alt=""
            aria-hidden="true"
            className="energy-icon"
          />
        ))}
      </span>
      <span>{labels[level]}</span>
    </div>
  );
};
