import type { Activity } from "../types/activity";

// Import existing components that match the column data
// (Assuming these exist and match the design based on their names)
import { CategoryTag } from "./CategoryTag";
import { EnergyTag } from "./EnergyTag";
import { StatusBadge } from "./StatusBadge";

import "./DashboardTable.css";

function SortColumnIcon() {
  return (
    <svg className="sort-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3L11 6.5H5L8 3Z" fill="#fcf6e5"/>
      <path d="M8 13L5 9.5H11L8 13Z" fill="#fcf6e5"/>
    </svg>
  );
}

interface DashboardTableProps {
  activities: Activity[];
  onEditActivity: (activityId: string) => void;
}

export default function DashboardTable({
  activities,
  onEditActivity,
}: DashboardTableProps) {
  // Helper to format the grade range from min and max numbers to "K-12", "3-5", etc.
  const formatGradeRange = (range: { min: number; max: number }) => {
    const minText = range.min === 0 ? "K" : range.min.toString();
    return `${minText}-${range.max}`;
  };

  // Helper to format group size
  const formatGroupSize = (size: {
    min: number;
    max: number;
    anySize: boolean;
  }) => {
    if (size.anySize) return "Any";
    return `${size.min}-${size.max}`;
  };

  const formatEnergyLevel = (level: "Low" | "Medium" | "High"): 1 | 2 | 3 => {
    if (level === "Low") return 1;
    if (level === "Medium") return 2;
    return 3;
  };

  return (
    <div className="table-container">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>
              <span className="th-content">
                Title
                <SortColumnIcon />
              </span>
            </th>
            <th>
              <span className="th-content">
                Category
                <SortColumnIcon />
              </span>
            </th>
            <th>
              <span className="th-content">
                Energy
                <SortColumnIcon />
              </span>
            </th>
            <th>
              <span className="th-content">
                Grade Level
                <SortColumnIcon />
              </span>
            </th>
            <th>
              <span className="th-content">
                Group Size
                <SortColumnIcon />
              </span>
            </th>
            <th>
              <span className="th-content">
                Duration
                <SortColumnIcon />
              </span>
            </th>
            <th>Status</th>
            <th>{/* Actions column (three dots) */}</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr
              key={activity._id}
              className="table-row"
              onClick={() => onEditActivity(activity._id)}
            >
              <td className="col-title">{activity.title}</td>
              <td>
                {activity.category.map((c) => (
                  <CategoryTag key={c} category={c} selected />
                ))}
              </td>
              <td>
                <EnergyTag level={formatEnergyLevel(activity.energyLevel)} />
              </td>
              <td className="col-grade">
                {formatGradeRange(activity.gradeRange)}
              </td>
              <td className="col-group">
                {formatGroupSize(activity.groupSize)}
              </td>
              <td className="col-duration">{activity.duration}</td>
              <td>
                <StatusBadge status={activity.status} />
              </td>
              <td className="col-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click when clicking options
                    // Open options menu logic here
                  }}
                  aria-label="More options"
                >
                  &#8942; {/* Vertical Ellipsis */}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
