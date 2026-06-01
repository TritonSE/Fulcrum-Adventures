import { AdminLayout } from "../components/AdminLayout";

import "./AdminHome.css";

export function AdminHome() {
  return (
    <AdminLayout>
      <main className="admin-home__main">
        <p className="admin-home__message">You are signed in to the admin portal.</p>
      </main>
    </AdminLayout>
  );
}
