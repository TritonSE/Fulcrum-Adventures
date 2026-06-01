import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { AccountMenu } from "./AccountMenu";
import { NavBar } from "./NavBar";
import { clearAdminSession, getStoredUser } from "../api/auth";

import "./AdminLayout.css";

function userInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return (first + last).toUpperCase() || "A";
}

type AdminLayoutProps = {
  children: ReactNode;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
};

export function AdminLayout({ children, tabs, activeTab, onTabChange }: AdminLayoutProps) {
  const navigate = useNavigate();
  const avatarRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = getStoredUser();
  const initials = user
    ? userInitials(user.firstName, user.lastName)
    : "A";

  function onLogout() {
    clearAdminSession();
    navigate("/sign-in", { replace: true });
  }

  function onSettings() {
    navigate("/settings");
  }

  function onLogoClick() {
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <div className="admin-layout">
      <NavBar
        userInitials={initials}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onLogoClick={onLogoClick}
        avatarRef={avatarRef}
        onAvatarClick={() => setMenuOpen((open) => !open)}
        menuOpen={menuOpen}
        menu={
          <AccountMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            onSettings={onSettings}
            onLogout={onLogout}
            anchorRef={avatarRef}
          />
        }
      />
      {children}
    </div>
  );
}
