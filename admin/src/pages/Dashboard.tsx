import { useEffect, useState } from "react";
import { NavBar } from "../components/NavBar";
import DashboardTable from "../components/DashboardTable";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import { Pagination } from "../components/Pagination";
import type { Activity } from "../types/activity";
import { fetchActivities, getActivityStats } from "../api/activity";

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
type GroupSize = "Small (3-15)" | "Medium (15-30)" | "Large (30+)";

type DashboardFilters = {
  category?: Category[];
  duration?: Duration[];
  gradeLevel?: GradeLevel[];
  groupSize?: GroupSize[];
  energyLevel?: EnergyLevel;
  environment?: Environment[];
  setup?: Setup;
};

type MultiFilterKey =
  | "category"
  | "duration"
  | "gradeLevel"
  | "groupSize"
  | "environment";

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
    key: "groupSize",
    label: "Group Size",
    options: ["Small (3-15)", "Medium (15-30)", "Large (30+)"],
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
  "groupSize",
  "environment",
];

function isMultiFilterKey(key: keyof DashboardFilters): key is MultiFilterKey {
  return multiFilterKeys.includes(key as MultiFilterKey);
}

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
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

  useEffect(() => {
    const getActivityData = async () => {
      const request: Record<string, string> = {
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
        request.category = appliedFilters.category.join(",");
      }
      if (appliedFilters.duration?.length) {
        request.duration = appliedFilters.duration.join(",");
      }
      if (appliedFilters.gradeLevel?.length) {
        request.gradeLevel = appliedFilters.gradeLevel.join(",");
      }
      if (appliedFilters.groupSize?.length) {
        request.groupSize = appliedFilters.groupSize.join(",");
      }
      if (appliedFilters.energyLevel) {
        request.energyLevel = appliedFilters.energyLevel;
      }
      if (appliedFilters.environment?.length) {
        request.environment = appliedFilters.environment.join(",");
      }
      if (appliedFilters.setup) {
        request.setup = appliedFilters.setup;
      }

      const activitiesResult = await fetchActivities(request);
      if (activitiesResult.success) {
        setActivities(activitiesResult.data.activities);
        setTotalActivities(activitiesResult.data.total);
        setTotalPages(activitiesResult.data.totalPages);
      } else {
        console.error("Failed to fetch activities:", activitiesResult.error);
      }
    };
    getActivityData();
  }, [currentPage, statusFilter, searchQuery, sort, appliedFilters]);

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
        setCategoryCounts(counts);
      }
    };
    getActivityStatsData();
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (tab: "All" | "Draft" | "Published") => {
    setStatusFilter(tab);
    setCurrentPage(1);
  };

  const handleEditActivity = (id: string) => {
    console.log("Edit activity clicked:", id);
    // Future: navigate to the edit page
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
  const hasNoActivities = activities.length === 0;

  return (
    <div style={{ background: "#F9F9F9", minHeight: "100vh" }}>
      <NavBar />
      <div className="dashboard-container">
        <div className="header-and-category-cards-container">
          <div className="header-container">
            <p className="header-text">Activities Dashboard</p>
            <div className="header-buttons-container">
              <Button
                icon={MailingListIcon}
                variant="secondary-left"
                onClick={() => {
                  window.location.href = "/mailing-list";
                }}
              >
                Mailing List
              </Button>
              <Button icon={AddIcon}>Create New Activity</Button>
            </div>
          </div>
          <div className="category-cards-container">
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                numActivities={categoryCounts ? categoryCounts[category] : 0}
                totalActivities={totalActivities}
              />
            ))}
          </div>

          <div className="search-input-container" style={{ display: "none" }}>
            {/* hiding the old search input to use the new dashboard controls if needed. Actually we want the search input */}
            <img src={SearchIcon} className="search-input-icon" alt="Search" />
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
            {/* Toggle tabs for All / Draft / Published */}
            <div className="status-tabs-container">
              {(["All", "Draft", "Published"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`status-tab ${statusFilter === tab ? "active" : ""}`}
                  onClick={() => handleStatusFilterChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="sort-filter-actions">
              <div className="dropdown-control">
                <button
                  className={`sort-btn ${
                    isSortDropdownOpen || sort !== "-createdAt" ? "active" : ""
                  } ${hasNoActivities ? "empty" : ""}`}
                  onClick={toggleSortDropdown}
                  aria-expanded={isSortDropdownOpen}
                  aria-haspopup="menu"
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
                  } ${hasNoActivities ? "empty" : ""}`}
                  onClick={toggleFilterDropdown}
                  aria-expanded={isFilterDropdownOpen}
                  aria-haspopup="dialog"
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
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
