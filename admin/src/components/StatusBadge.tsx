import React from "react";
import "./Tags.css";

type StatusType = "Published" | "Draft";

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClass = `badge-status--${status.toLowerCase()}`;

  return <div className={`tag badge-status ${statusClass}`}>{status}</div>;
};
