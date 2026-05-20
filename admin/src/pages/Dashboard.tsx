import { useEffect, useState } from "react";
import { NavBar } from "../components/NavBar";
import DashboardTable from "../components/DashboardTable";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import { Pagination } from "../components/Pagination";
import type { Activity } from "../types/activity";
import { listActivities } from "../api/activity";

import "./Dashboard.css";
import AddIcon from "../../icons/add.svg";
import MailingListIcon from "../../icons/mailing_list.svg";
import SearchIcon from "../../icons/search.svg";
import type { Category } from "../components/CategoryCard";
import { CategoryCard } from "../components/CategoryCard";

const categories: Category[] = [
  "Opener",
  "Icebreaker",
  "Connection",
  "Active",
  "Debrief",
  "Team Challenge",
];

const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Draft" | "Published"
  >("All");

  useEffect(() => {
    const fetchActivities = async () => {
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

      const result = await listActivities(request);
      if (result.success) {
        setActivities(result.data.activities);
        setTotalActivities(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        console.error("Failed to fetch activities:", result.error);
      }
    };
    fetchActivities();
  }, [currentPage, statusFilter, searchQuery]);

  function findNumActivitiesInCategory(category: Category): number {
    return activities.filter((activity) =>
      activity.category.find((c) => c === category),
    ).length;
  }

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
                numActivities={findNumActivitiesInCategory(category)}
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
            <div className="status-tabs-placeholder">
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
              <button className="sort-btn">
                Sort
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    stroke="#153a7a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="filter-btn">
                Filter
                <svg
                  width="13"
                  height="16"
                  viewBox="0 0 13 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.5 1H12.5L7.5 8.5V13.5L5.5 15V8.5L0.5 1Z"
                    stroke="#153a7a"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
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
