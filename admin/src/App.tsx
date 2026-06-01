import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { NavBar } from "./components/NavBar";
import { Button } from "./components/Button";
import { ActivityEditorPage } from "./pages/ActivityEditorPage";
import "./App.css";

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <main className="admin-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Admin Portal</p>
          <h1>Activity management lives inside the admin app.</h1>
          <p className="dashboard-copy">
            Create new activities and edit existing ones here in the deployed Vite admin portal.
          </p>
        </div>

        <div className="dashboard-actions">
          <Button icon={false} onClick={() => navigate("/activities/new")}>
            Create Activity
          </Button>
          <Button
            icon={false}
            variant="secondary-left"
            onClick={() => navigate("/activities/example-activity-id/edit")}
          >
            Open Edit Route
          </Button>
        </div>
      </section>

      <section className="dashboard-card-grid">
        <article className="dashboard-card">
          <h2>Create</h2>
          <p>Use <code>/activities/new</code> to publish or draft a new activity.</p>
        </article>

        <article className="dashboard-card">
          <h2>Edit</h2>
          <p>Use <code>/activities/:activityId/edit</code> for the existing activity workflow.</p>
        </article>
      </section>
    </main>
  );
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <div className="app-shell">
      <NavBar
        userInitials="FA"
        tabs={["Dashboard", "Activities"]}
        activeTab={currentPath.startsWith("/activities") ? "Activities" : "Dashboard"}
        onTabChange={(tab) => {
          navigate(tab === "Activities" ? "/activities/new" : "/dashboard");
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/activities/new" element={<ActivityEditorPage mode="create" />} />
        <Route path="/activities/:activityId/edit" element={<ActivityEditorPage mode="edit" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default AppShell;
