import { NavBar } from "../components/NavBar";
import { Button } from "../components/Button";
import "./Dashboard.css";
import AddIcon from "../../icons/add.svg";
import MailingListIcon from "../../icons/mailing_list.svg";
import SearchIcon from "../../icons/search.svg";
import type { Category } from "../components/CategoryCard";
import { CategoryCard } from "../components/CategoryCard";
import { useEffect, useState } from "react";
import { listActivities } from "../api/activity";
import type { Activity } from "../types/activity";

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
    //TODO: check if category should be singular or an array
    return activities.filter((activity) => activity.category.find((c) => c === category)).length;
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

  return (
    <div style={{ background: "#F9F9F9" }}>
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
          <div className="searchInputContainer">
            <img src={SearchIcon} className="searchInputIcon" />
            <input
              type="text"
              className="searchInput"
              placeholder="Search activities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
