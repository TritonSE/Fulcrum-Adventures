import React, { useState } from "react";
import { NavBar } from "../components/NavBar";
import DashboardTable from "../components/DashboardTable";
import { Button } from "../components/Button";
import { SearchBar } from "../components/SearchBar";
import type { Activity } from "../types/activity";
// Assuming these exist or will exist based on the layout
// import CategorySummaryCard from '../components/CategorySummaryCard';
// import FilterTabs from '../components/FilterTabs';

import "./Dashboard.css";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data to populate the dashboard for now based on the image
  const mockActivities: Activity[] = [
    {
      _id: "1",
      title: "Rock Paper Scissors...",
      overview: "Fun active game",
      category: "Opener",
      gradeRange: { min: 0, max: 12 },
      groupSize: { min: 3, max: 15, anySize: false },
      duration: "30+ min",
      energyLevel: "Low",
      environment: ["Any"],
      setup: "None",
      facilitateSections: [],
      materials: [],
      selTags: [],
      status: "Published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Rock Paper Scissors...",
      overview: "Fun active game",
      category: "Opener",
      gradeRange: { min: 0, max: 12 },
      groupSize: { min: 3, max: 15, anySize: false },
      duration: "30+ min",
      energyLevel: "Low",
      environment: ["Any"],
      setup: "None",
      facilitateSections: [],
      materials: [],
      selTags: [],
      status: "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const handleEditActivity = (id: string) => {
    console.log("Edit activity clicked:", id);
    // Future: navigate to the edit page
  };

  return (
    <div className="dashboard-layout">
      {/* Fixed NavBar, assuming it handles its own positioning */}
      <NavBar />

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Activities Dashboard</h1>
          <Button variant="primary">+ Create New Activity</Button>
        </div>

        {/* Top Summaries - to be implemented soon */}
        <div className="category-summaries-placeholder">
          {/* Placeholders for Opener, Icebreaker, etc. */}
        </div>

        {/* Searching and filtering */}
        <div className="dashboard-controls">
          <div className="search-container">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search activities"
            />
          </div>

          <div className="filter-row">
            {/* Toggle tabs for All / Draft / Published */}
            <div className="status-tabs-placeholder">
              <button className="status-tab active">All</button>
              <button className="status-tab">Draft</button>
              <button className="status-tab">Published</button>
            </div>

            <div className="sort-filter-actions">
              <Button variant="secondary">Sort ▼</Button>
              <Button variant="secondary">Filter</Button>
            </div>
          </div>
        </div>

        {/* The Table View */}
        <div className="table-wrapper">
          <DashboardTable
            activities={mockActivities}
            onEditActivity={handleEditActivity}
          />
        </div>
      </main>
    </div>
  );
}
