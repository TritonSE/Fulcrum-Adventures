import './DashboardHomePage.css'

import { Link } from 'react-router-dom'

export function DashboardHomePage() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-eyebrow">Admin Home</p>
        <h1>Fulcrum Admin Portal</h1>
        <p className="dashboard-copy">
          This is the app shell for the real deployed admin portal. The create/edit experience lives on its
          own route instead of replacing the homepage.
        </p>
        <div className="dashboard-actions">
          <Link to="/activities/new" className="dashboard-primary-link">
            Open Create Activity
          </Link>
        </div>
      </section>

      <section className="dashboard-card-grid">
        <article className="dashboard-card">
          <h2>Create / Edit</h2>
          <p>Use the dedicated route to work on the activity form you migrated from `frontend/admin`.</p>
        </article>
        <article className="dashboard-card">
          <h2>Why This Split</h2>
          <p>Keeping the feature off `/` makes the movement cleaner and matches the real app structure better.</p>
        </article>
      </section>
    </main>
  )
}
