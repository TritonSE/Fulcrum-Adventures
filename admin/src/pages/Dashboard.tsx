import { NavBar } from "../components/NavBar";
import { Button } from "../components/Button";
import "./Dashboard.css";
import AddIcon from "../../icons/add.svg";
import MailingListIcon from "../../icons/mailing_list.svg";
import SearchIcon from "../../icons/search.svg";
import type { Category } from "../components/CategoryCard";
import { CategoryCard } from "../components/CategoryCard";
import { useState } from "react";

const categories: Category[] = [
  "Opener",
  "Icebreaker",
  "Connection",
  "Active",
  "Debrief",
  "Team Challenge",
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div style={{ background: "#F9F9F9" }}>
      <NavBar />
      <div className="dashboardContainer">
        <div className="headerAndCategoryCardsContainer">
          <div className="headerContainer">
            <p className="headerText">Activities Dashboard</p>
            <div className="headerButtonsContainer">
              <Button icon={MailingListIcon} variant="secondary-left">
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
                percentOfActivities={12}
                numActivities={12}
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
