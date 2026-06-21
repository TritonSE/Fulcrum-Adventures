import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import DashboardTable from "../components/DashboardTable";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import { Pagination } from "../components/Pagination";
import { Toast } from "../components/Toast";
import type { Activity } from "../types/activity";
import {
  fetchActivities,
  getActivityStats,
  type ListActivitiesRequest,
} from "../api/activity";

import "./Dashboard.css";
import AddIcon from "../../icons/add.svg";
import LightningIcon from "../../icons/lightning.svg";
import LightningUnselectedIcon from "../../icons/lightning_unselected.svg";
import MailingListIcon from "../../icons/mailing_list.svg";
import SearchIcon from "../../icons/search.svg";
import { CategoryCard } from "../components/CategoryCard";
import type {
  Category,
  Duration,
  EnergyLevel,
  Environment,
  Setup,
} from "../types/activity";

const categories: Category[] = [
  "Opener",
  "Icebreaker",
  "Connection",
  "Active",
  "Debrief",
  "Team Challenge",
];

const ITEMS_PER_PAGE = 10;

type SortValue = "-createdAt" | "title" | "-title" | "-updatedAt";
type GradeLevel = "K-2" | "3-5" | "6-8" | "9-12";

type DashboardFilters = {
  category?: Category[];
  duration?: Duration[];
  gradeLevel?: GradeLevel[];
  energyLevel?: EnergyLevel;
  environment?: Environment[];
  setup?: Setup;
};

type MultiFilterKey = "category" | "duration" | "gradeLevel" | "environment";

const sortOptions: { label: string; value: SortValue }[] = [
  { label: "A - Z", value: "title" },
  { label: "Z - A", value: "-title" },
  { label: "Last Modified", value: "-updatedAt" },
];

const filterSections = [
  {
    key: "category",
    label: "Category",
    options: [
      "All",
      "Opener",
      "Icebreaker",
      "Active",
      "Connection",
      "Debrief",
      "Team Challenge",
    ],
  },
  {
    key: "duration",
    label: "Duration",
    options: ["5-15 min", "15-30 min", "30+ min"],
  },
  {
    key: "gradeLevel",
    label: "Grade Level",
    options: ["K-2", "3-5", "6-8", "9-12"],
  },
  {
    key: "energyLevel",
    label: "Energy Level",
    options: ["Low", "Medium", "High"],
  },
  {
    key: "environment",
    label: "Environment",
    options: ["Any Environment", "Classroom", "Field", "Gym/MPR", "Blacktop"],
  },
  {
    key: "setup",
    label: "Set Up",
    options: ["Props", "No Props"],
  },
] as const;

const multiFilterKeys: MultiFilterKey[] = [
  "category",
  "duration",
  "gradeLevel",
  "environment",
];

function isMultiFilterKey(key: keyof DashboardFilters): key is MultiFilterKey {
  return multiFilterKeys.includes(key as MultiFilterKey);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trueTotalActivities, setTrueTotalActivities] = useState(0);
  const [categoryCounts, setCategoryCounts] =
    useState<Record<Category, number>>();
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [sort, setSort] = useState<SortValue>("-createdAt");
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>({});
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Draft" | "Published"
  >("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [toastKey, setToastKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const sortFilterActionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        sortFilterActionsRef.current &&
        !sortFilterActionsRef.current.contains(target)
      ) {
        setIsSortDropdownOpen(false);
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const getActivityData = async () => {
      const request: ListActivitiesRequest = {
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      };
      if (statusFilter !== "All") {
        request.status = statusFilter;
      }
      if (searchQuery.trim()) {
        request.search = searchQuery.trim();
      }
      if (sort !== "-createdAt") {
        request.sort = sort;
      }
      if (appliedFilters.category?.length) {
        request.category = appliedFilters.category;
      }
      if (appliedFilters.duration?.length) {
        request.duration = appliedFilters.duration;
      }
      if (appliedFilters.gradeLevel?.length) {
        request.gradeLevel = appliedFilters.gradeLevel;
      }
      if (appliedFilters.energyLevel) {
        request.energyLevel = appliedFilters.energyLevel;
      }
      if (appliedFilters.environment?.length) {
        request.environment = appliedFilters.environment;
      }
      if (appliedFilters.setup) {
        request.setup = appliedFilters.setup;
      }

      const activitiesResult = await fetchActivities(request);
      if (activitiesResult.success) {
        setActivities(activitiesResult.data.activities);
        setTotalPages(activitiesResult.data.totalPages);
      } else {
        console.error("Failed to fetch activities:", activitiesResult.error);
      }
      setIsLoading(false);
    };
    getActivityData();
  }, [
    currentPage,
    statusFilter,
    searchQuery,
    sort,
    appliedFilters,
    refreshKey,
  ]);

  useEffect(() => {
    const getActivityStatsData = async () => {
      const activityStatsResult = await getActivityStats();
      if (activityStatsResult.success) {
        const counts: Record<Category, number> = {
          Opener: 0,
          Icebreaker: 0,
          Connection: 0,
          Active: 0,
          Debrief: 0,
          "Team Challenge": 0,
        };
        activityStatsResult.data.categories.forEach((categoryStat) => {
          counts[categoryStat.category as Category] = categoryStat.count;
        });
        setTrueTotalActivities(activityStatsResult.data.total);
        setCategoryCounts(counts);
      }
      setIsStatsLoading(false);
    };
    getActivityStatsData();
  }, [refreshKey]);

  useEffect(() => {
    const nextToastMessage = (
      location.state as { toastMessage?: string } | null
    )?.toastMessage;
    if (!nextToastMessage) return;

    const toastTimeoutId = window.setTimeout(() => {
      setToastMessage(nextToastMessage);
      setToastKey((prev) => prev + 1);
      navigate(location.pathname, { replace: true, state: null });
    }, 0);

    return () => window.clearTimeout(toastTimeoutId);
  }, [location.pathname, location.state, navigate]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (tab: "All" | "Draft" | "Published") => {
    setStatusFilter(tab);
    setCurrentPage(1);
  };

  const handleEditActivity = (id: string) => {
    navigate(`/activities/${id}/edit`);
  };

  const refreshDashboardData = () => {
    setRefreshKey((key) => key + 1);
  };

  const handleActivityDeleted = (deletedActivity: Activity) => {
    setActivities((prevActivities) => {
      const nextActivities = prevActivities.filter(
        (activity) => activity._id !== deletedActivity._id,
      );
      if (nextActivities.length === 0 && currentPage > 1) {
        setCurrentPage((page) => Math.max(1, page - 1));
      }
      return nextActivities;
    });

    setTrueTotalActivities((total) => Math.max(0, total - 1));

    setCategoryCounts((prevCounts) => {
      if (!prevCounts) return prevCounts;
      const nextCounts = { ...prevCounts };
      deletedActivity.category.forEach((category) => {
        nextCounts[category] = Math.max(0, nextCounts[category] - 1);
      });
      return nextCounts;
    });
  };

  const toggleSortDropdown = () => {
    setIsSortDropdownOpen((isOpen) => !isOpen);
    setIsFilterDropdownOpen(false);
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen((isOpen) => !isOpen);
    setIsSortDropdownOpen(false);
  };

  const handleSortChange = (nextSort: SortValue) => {
    setSort(nextSort);
    setCurrentPage(1);
    setIsSortDropdownOpen(false);
  };

  const handleFilterChange = (key: keyof DashboardFilters, option: string) => {
    setDraftFilters((filters) => {
      const nextFilters = { ...filters };
      if (key === "category" && option === "All") {
        delete nextFilters.category;
        return nextFilters;
      }

      if (isMultiFilterKey(key)) {
        const values = (nextFilters[key] as string[] | undefined) ?? [];
        const isSelected = values.includes(option);
        const nextValues = isSelected
          ? values.filter((value) => value !== option)
          : [...values, option];

        if (nextValues.length === 0) {
          delete nextFilters[key];
        } else {
          nextFilters[key] = nextValues as never;
        }
        return nextFilters;
      }

      const value =
        key === "setup" ? (option === "Props" ? "Required" : "None") : option;

      if (nextFilters[key] === value) {
        delete nextFilters[key];
      } else {
        nextFilters[key] = value as never;
      }
      return nextFilters;
    });
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setCurrentPage(1);
    setIsFilterDropdownOpen(false);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setAppliedFilters({});
    setCurrentPage(1);
    setIsFilterDropdownOpen(false);
  };

  const getFilterValues = (key: keyof DashboardFilters): string[] => {
    const value = draftFilters[key];
    if (Array.isArray(value)) return value;
    if (key === "setup") {
      if (value === "Required") return ["Props"];
      if (value === "None") return ["No Props"];
    }
    return value ? [value] : [];
  };

  const selectedEnergyLevel =
    draftFilters.energyLevel === "Low"
      ? 1
      : draftFilters.energyLevel === "Medium"
        ? 2
        : draftFilters.energyLevel === "High"
          ? 3
          : 0;
  const hasAppliedFilters = Object.keys(appliedFilters).length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#F9F9F9",
        minHeight: "100dvh",
      }}
    >
      <NavBar />
      {isLoading || isStatsLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Loading...</p>
        </div>
      ) : (
        <div className="dashboard-container">
          <div className="header-and-category-cards-container">
            <div className="header-container">
              <p className="header-text">Activities Dashboard</p>
              <div className="header-buttons-container">
                <Button
                  icon={MailingListIcon}
                  variant="secondary-left"
                  onClick={() => navigate("/mailing-list")}
                >
                  Mailing List
                </Button>
                <Button
                  icon={AddIcon}
                  onClick={() => navigate("/activities/new")}
                >
                  Create New Activity
                </Button>
              </div>
            </div>
            <div className="category-cards-container">
              {categories.map((category) => (
                <CategoryCard
                  key={category}
                  category={category}
                  numActivities={categoryCounts ? categoryCounts[category] : 0}
                  totalActivities={trueTotalActivities}
                />
              ))}
            </div>

            <div className="search-input-container" style={{ display: "none" }}>
              <img
                src={SearchIcon}
                className="search-input-icon"
                alt="Search"
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search activities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="search-container">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search activities"
              />
            </div>

            <div className="filter-row">
              <div className="status-tabs-container">
                {(["All", "Draft", "Published"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`status-tab ${
                      statusFilter === tab ? "active" : ""
                    }`}
                    onClick={() => handleStatusFilterChange(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="sort-filter-actions" ref={sortFilterActionsRef}>
                <div className="dropdown-control">
                  <button
                    className={`sort-btn ${
                      isSortDropdownOpen || sort !== "-createdAt"
                        ? "active"
                        : ""
                    } ${activities.length === 0 ? "empty" : ""}`}
                    onClick={toggleSortDropdown}
                    aria-expanded={isSortDropdownOpen}
                    aria-haspopup="menu"
                    disabled={activities.length === 0}
                  >
                    Sort
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M5.99837 7.16667L11.8317 0.5H0.165039L5.99837 7.16667Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  {isSortDropdownOpen && (
                    <div className="sort-dropdown" role="menu">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`sort-option ${
                            sort === option.value ? "selected" : ""
                          }`}
                          role="menuitem"
                          onClick={() => handleSortChange(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="dropdown-control">
                  <button
                    className={`filter-btn ${
                      isFilterDropdownOpen || hasAppliedFilters ? "active" : ""
                    } ${
                      activities.length === 0 && !hasAppliedFilters
                        ? "empty"
                        : ""
                    }`}
                    onClick={toggleFilterDropdown}
                    aria-expanded={isFilterDropdownOpen}
                    aria-haspopup="dialog"
                    disabled={activities.length === 0 && !hasAppliedFilters}
                  >
                    Filter
                    <svg
                      width="13"
                      height="16"
                      viewBox="0 0 13 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M0.5 1H12.5L7.5 8.5V13.5L5.5 15V8.5L0.5 1Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {isFilterDropdownOpen && (
                    <div className="filters-dropdown" role="dialog">
                      <div className="filters-dropdown-content">
                        {filterSections.map((section) => (
                          <div className="filter-section" key={section.label}>
                            <p className="filter-section-title">
                              {section.label}
                            </p>
                            {section.label === "Energy Level" ? (
                              <div
                                className="energy-filter-icons"
                                aria-label="Energy level filters"
                              >
                                {[1, 2, 3].map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    className={`energy-filter-icon-btn ${
                                      selectedEnergyLevel >= level
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleFilterChange(
                                        "energyLevel",
                                        section.options[level - 1],
                                      )
                                    }
                                    aria-label={`Energy level ${level}`}
                                    aria-pressed={selectedEnergyLevel === level}
                                  >
                                    <img
                                      src={
                                        selectedEnergyLevel >= level
                                          ? LightningIcon
                                          : LightningUnselectedIcon
                                      }
                                      className="energy-filter-icon"
                                      alt=""
                                      aria-hidden="true"
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="filter-tags">
                                {section.options.map((option) => (
                                  <button
                                    key={option}
                                    type="button"
                                    className={`filter-tag ${
                                      getFilterValues(
                                        section.key as keyof DashboardFilters,
                                      ).includes(option) ||
                                      (section.key === "category" &&
                                        option === "All" &&
                                        !draftFilters.category?.length)
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleFilterChange(
                                        section.key as keyof DashboardFilters,
                                        option,
                                      )
                                    }
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="filters-footer">
                        <button
                          type="button"
                          className="clear-filters-btn"
                          onClick={clearFilters}
                        >
                          Reset All
                        </button>
                        <button
                          type="button"
                          className="apply-filters-btn"
                          onClick={applyFilters}
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="table-wrapper"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <DashboardTable
              activities={activities}
              onEditActivity={handleEditActivity}
              categoryFilters={appliedFilters.category}
              onDeleteActivity={handleActivityDeleted}
              onDataChange={refreshDashboardData}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      {toastMessage ? (
        <Toast
          key={toastKey}
          message={toastMessage}
          onClose={() => setToastMessage("")}
        />
      ) : null}
    </div>
  );
}
