import { useNavigate } from "react-router-dom";

import { NavBar } from "../components/NavBar";
import { clearAdminSession } from "../api/auth";

import "./AdminHome.css";

export function AdminHome() {
  const navigate = useNavigate();

  function onLogout() {
    clearAdminSession();
    navigate("/sign-in", { replace: true });
  }

  return (
    <div className="admin-home">
      <NavBar />
      <main className="admin-home__main">
        <p className="admin-home__message">You are signed in to the admin portal.</p>
        <button type="button" className="admin-home__logout" onClick={onLogout}>
          Log out
        </button>
      </main>
    </div>
  );
}
