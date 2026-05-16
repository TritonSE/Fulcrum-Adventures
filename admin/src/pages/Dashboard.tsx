import { useEffect, useState } from "react";
import { NavBar } from "../components/NavBar";
import DashboardTable from "../components/DashboardTable";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import type { Activity } from "../types/activity";

import "./Dashboard.css";
import AddIcon from "../../icons/add.svg";
import MailingListIcon from "../../icons/mailing_list.svg";
import SearchIcon from "../../icons/search.svg";
import type { Category } from "../components/CategoryCard";
import { CategoryCard } from "../components/CategoryCard";
import { listActivities } from "../api/activity";

const categories: Category[] = [
  "Opener",
  "Icebreaker",
  "Connection",
  "Active",
  "Debrief",
  "Team Challenge",
];

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  function findNumActivitiesInCategory(category: Category): number {
    return activities.filter((activity) =>
      activity.category.find((c) => c === category),
    ).length;
  }

  useEffect(() => {
    const fetchActivities = async () => {
      const result = await listActivities({});
      if (result.success) {
        setActivities(result.data);
      } else {
        console.error("Failed to fetch activities:", result.error);
      }
    };
    fetchActivities();
  }, []);

  const handleEditActivity = (id: string) => {
    console.log("Edit activity clicked:", id);
    // Future: navigate to the edit page
  };

  return (
    <div style={{ background: "#F9F9F9", minHeight: "100vh" }}>
      <NavBar />
      <div className="dashboardContainer">
        <div className="headerAndCategoryCardsContainer">
          <div className="headerContainer">
            <p className="headerText">Activities Dashboard</p>
            <div className="headerButtonsContainer">
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
          <div className="categoryCardsContainer">
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                numActivities={findNumActivitiesInCategory(category)}
                totalActivities={activities.length}
              />
            ))}
          </div>

          <div className="filter-row">
            {/* Toggle tabs for All / Draft / Published */}
            <div className="status-tabs-placeholder">
              <button className="status-tab active">All</button>
              <button className="status-tab">Draft</button>
              <button className="status-tab">Published</button>
            </div>

            <div className="sort-filter-actions">
              <Button variant="secondary-left">Sort ▼</Button>
              <Button variant="secondary-left">Filter</Button>
            </div>
          </div>

          <div className="searchInputContainer" style={{ display: "none" }}>
            {/* hiding the old search input to use the new dashboard controls if needed. Actually we want the search input */}
            <img src={SearchIcon} className="searchInputIcon" alt="Search" />
            <input
              type="text"
              className="searchInput"
              placeholder="Search activities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="search-container">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search activities"
            />
          </div>
        </div>

        <div
          className="table-wrapper"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            marginTop: "24px",
            width: "100%",
          }}
        >
          <DashboardTable
            activities={activities}
            onEditActivity={handleEditActivity}
          />
        </div>
      </div>
    </div>
  );
}
