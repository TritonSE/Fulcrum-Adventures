import type { Activity } from "../types/activity";
import { useEffect, useState } from "react";
import DeleteIcon from "../../icons/delete.svg";
import UnpublishIcon from "../../icons/unpublish.svg";

// Import existing components that match the column data
// (Assuming these exist and match the design based on their names)
import { CategoryTag } from "./CategoryTag";
import { EnergyTag } from "./EnergyTag";
import { StatusBadge } from "./StatusBadge";

import "./DashboardTable.css";
import { Toast } from "./Toast";
import { deleteActivity, updateActivityStatus } from "../api/activity";
import { ConfirmationPopup } from "./ConfirmationPopup";

interface DashboardTableProps {
  activities: Activity[];
  onEditActivity: (activityId: string) => void;
  categoryFilters?: Activity["category"];
}

const CATEGORY_ORDER: Activity["category"] = [
  "Opener",
  "Icebreaker",
  "Connection",
  "Active",
  "Debrief",
  "Team Challenge",
];

const sortCategoriesByOrder = (categories: Activity["category"]) =>
  categories
    .slice()
    .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));

const getPrimaryCategory = (
  categories: Activity["category"],
  filterCategories?: Activity["category"],
) => {
  if (filterCategories?.length) {
    const filteredCategories = CATEGORY_ORDER.filter(
      (category) =>
        filterCategories.includes(category) && categories.includes(category),
    );
    if (filteredCategories.length) {
      return filteredCategories[0];
    }
  }

  return sortCategoriesByOrder(categories)[0];
};

export default function DashboardTable({
  activities,
  onEditActivity,
  categoryFilters,
}: DashboardTableProps) {
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastActionText, setToastActionText] = useState("");
  const [toastAction, setToastAction] = useState<(() => void) | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [showDeleteConfirmationPopup, setShowDeleteConfirmationPopup] =
    useState(false);
  const [activityToDeleteId, setActivityToDeleteId] = useState<string | null>(
    null,
  );
  const [prevActivities, setPrevActivities] = useState(activities);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const menus = document.querySelectorAll(".action-menu-wrapper");
      for (const menu of menus) {
        if (menu.contains(target)) return;
      }
      setOpenActionMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (prevActivities !== activities) {
    setPrevActivities(activities);
    setOpenActionMenuId(null);
  }

  // Helper to format the grade range from min and max numbers to "K-12", "3-5", etc.
  const formatGradeRange = (
    range: { min: number; max: number } | null | undefined,
  ) => {
    if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max)) {
      return "-";
    }

    const minText = range.min === 0 ? "K" : range.min.toString();
    return `${minText}-${range.max}`;
  };

  // Helper to format group size
  const formatGroupSize = (
    size:
      | {
          min?: number;
          max?: number;
          anySize?: boolean;
        }
      | null
      | undefined,
  ) => {
    if (!size) return "-";
    if (size.anySize) return "Any";
    if (!Number.isFinite(size.min) || !Number.isFinite(size.max)) {
      return "-";
    }
    return `${size.min}-${size.max}`;
  };

  const formatEnergyLevel = (level: "Low" | "Medium" | "High"): 1 | 2 | 3 => {
    if (level === "Low") return 1;
    if (level === "Medium") return 2;
    return 3;
  };

  const handleUnpublishActivity = async (activityId: string) => {
    const result = await updateActivityStatus(activityId, "Draft");
    if (result.success) {
      activities.filter((activity) => activity._id === activityId)[0].status =
        "Draft";
      showUnpublishedToast(activityId);
    } else {
      console.error("Failed to unpublish activity: ", result.error);
    }
  };

  const handleRepublishActivity = async (activityId: string) => {
    const result = await updateActivityStatus(activityId, "Published");
    if (!result.success) {
      console.error("Failed to republish activity: ", result.error);
    } else {
      activities.filter((activity) => activity._id === activityId)[0].status =
        "Published";
      setToastMessage("");
    }
  };

  const showUnpublishedToast = (activityId: string) => {
    setToastActionText("Undo");
    setToastAction(() => () => handleRepublishActivity(activityId));
    setToastMessage("Activity Unpublished!");
    setToastKey((prev) => prev + 1);
  };

  const handleDeleteActivity = async (activityId: string | null) => {
    if (!activityId) return;
    const result = await deleteActivity(activityId);
    if (result.success) {
      activities.splice(
        activities.findIndex((activity) => activity._id === activityId),
        1,
      );
      setShowDeleteConfirmationPopup(false);
      setToastActionText("");
      setToastAction(null);
      setToastMessage("Activity Deleted");
      setToastKey((prev) => prev + 1);
    } else {
      console.error("Failed to delete activity: ", result.error);
    }
  };

  return activities.length > 0 ? (
    <div className="table-container">
      <table className="dashboard-table">
        <colgroup>
          <col className="title-col" />
          <col className="category-col" />
          <col className="energy-col" />
          <col className="grade-col" />
          <col className="group-col" />
          <col className="duration-col" />
          <col className="status-col" />
          <col className="actions-col" />
        </colgroup>
        <thead>
          <tr>
            <th>
              <span className="th-content">Title</span>
            </th>
            <th>
              <span className="th-content">Category</span>
            </th>
            <th>
              <span className="th-content">Energy</span>
            </th>
            <th>
              <span className="th-content">Grade Level</span>
            </th>
            <th>
              <span className="th-content">Group Size</span>
            </th>
            <th>
              <span className="th-content">Duration</span>
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
              <td className="col-category">
                <div className="category-tag-container">
                  {(() => {
                    const primaryCategory = getPrimaryCategory(
                      activity.category,
                      categoryFilters,
                    );
                    const extraCategories = sortCategoriesByOrder(
                      activity.category,
                    ).filter((category) => category !== primaryCategory);

                    return (
                      <>
                        <CategoryTag category={primaryCategory} selected />
                        {extraCategories.length > 0 && (
                          <div className="plus-categories-tag">
                            +{extraCategories.length}
                            <div className="category-tooltip" role="tooltip">
                              {extraCategories.map((category, index) => (
                                <CategoryTag
                                  category={category}
                                  key={`${category}-${index}`}
                                  selected
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </td>
              <td className="col-energy">
                <EnergyTag level={formatEnergyLevel(activity.energyLevel)} />
              </td>
              <td className="col-grade">
                {formatGradeRange(activity.gradeRange)}
              </td>
              <td className="col-group">
                {formatGroupSize(activity.groupSize)}
              </td>
              <td className="col-duration">
                {activity.duration ? activity.duration : "-"}
              </td>
              <td>
                <StatusBadge status={activity.status} />
              </td>
              <td className="col-actions">
                <div className="action-menu-wrapper">
                  <button
                    className={`action-btn ${
                      openActionMenuId === activity._id ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenActionMenuId((openId) =>
                        openId === activity._id ? null : activity._id,
                      );
                    }}
                    aria-expanded={openActionMenuId === activity._id}
                    aria-haspopup="menu"
                    aria-label="More options"
                  >
                    <span className="action-btn-dots" aria-hidden="true">
                      &#8942;
                    </span>
                  </button>
                  {openActionMenuId === activity._id && (
                    <div
                      className={`activity-action-menu ${
                        activity.status === "Draft" ? "delete-only" : ""
                      }`}
                      role="menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activity.status !== "Draft" && (
                        <button
                          type="button"
                          className="activity-action-menu-item"
                          role="menuitem"
                          onClick={() => {
                            setOpenActionMenuId(null);
                            handleUnpublishActivity(activity._id);
                          }}
                        >
                          <img
                            src={UnpublishIcon}
                            className="activity-action-menu-icon"
                            alt=""
                          />
                          Unpublish Activity
                        </button>
                      )}
                      <button
                        type="button"
                        className="activity-action-menu-item danger"
                        role="menuitem"
                        onClick={() => {
                          setOpenActionMenuId(null);
                          setActivityToDeleteId(activity._id);
                          setShowDeleteConfirmationPopup(true);
                        }}
                      >
                        <img
                          src={DeleteIcon}
                          className="activity-action-menu-icon"
                          alt=""
                        />
                        Delete Activity
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmationPopup
        isOpen={showDeleteConfirmationPopup}
        title="Delete Activity"
        message="Are you sure you want to delete this activity? This action cannot be undone."
        confirmText="Delete Activity"
        cancelText="Cancel"
        onConfirm={() => handleDeleteActivity(activityToDeleteId)}
        onCancel={() => setShowDeleteConfirmationPopup(false)}
      />

      {toastMessage && (
        <Toast
          key={toastKey}
          message={toastMessage}
          actionText={toastActionText}
          onAction={toastAction ?? undefined}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  ) : (
    <div className="no-activities-container">
      <p className="no-activities-text">No activities found.</p>
    </div>
  );
}
