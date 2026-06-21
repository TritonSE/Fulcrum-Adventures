import React, { useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import Logo from "../../icons/logo.svg";
import { clearAdminSession, getStoredUser } from "../api/auth";
import { AccountMenu } from "./AccountMenu";

interface NavBarProps {
  userInitials?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogoClick?: () => void;
  avatarRef?: RefObject<HTMLDivElement | null>;
  onAvatarClick?: () => void;
  menuOpen?: boolean;
  menu?: React.ReactNode;
}

function initialsFromName(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return (first + last).toUpperCase() || "A";
}

export const NavBar: React.FC<NavBarProps> = ({
  userInitials,
  tabs = [],
  activeTab,
  onTabChange,
  onLogoClick,
  avatarRef,
  onAvatarClick,
  menuOpen = false,
  menu,
}) => {
  const navigate = useNavigate();
  const defaultAvatarRef = useRef<HTMLDivElement>(null);
  const [defaultMenuOpen, setDefaultMenuOpen] = useState(false);
  const storedUser = getStoredUser();
  const resolvedAvatarRef = avatarRef ?? defaultAvatarRef;
  const resolvedMenuOpen = menu ? menuOpen : defaultMenuOpen;
  const resolvedUserInitials =
    userInitials ??
    (storedUser
      ? initialsFromName(storedUser.firstName, storedUser.lastName)
      : "A");

  function handleLogoClick() {
    if (onLogoClick) {
      onLogoClick();
      return;
    }
    navigate("/");
  }

  function handleAvatarClick() {
    if (onAvatarClick) {
      onAvatarClick();
      return;
    }
    setDefaultMenuOpen((open) => !open);
  }

  const resolvedMenu =
    menu ?? (
      <AccountMenu
        open={defaultMenuOpen}
        onClose={() => setDefaultMenuOpen(false)}
        onSettings={() => navigate("/settings")}
        onLogout={() => {
          void clearAdminSession().then(() => {
            navigate("/sign-in", { replace: true });
          });
        }}
        anchorRef={resolvedAvatarRef}
      />
    );

  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-logo"
        onClick={handleLogoClick}
        aria-label="Go to home"
      >
        <img src={Logo} alt="Fulcrum Logo" />
      </button>

      {tabs.length > 0 && (
        <div className="navbar-tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                className={`navbar-tab ${isActive ? "navbar-tab--active" : ""}`}
                onClick={() => onTabChange?.(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}

      <div className="navbar-user">
        <div className="navbar-user-menu-anchor" ref={resolvedAvatarRef}>
          <button
            type="button"
            className={`user-avatar ${
              resolvedMenuOpen ? "user-avatar--open" : ""
            }`}
            onClick={handleAvatarClick}
            aria-haspopup="menu"
            aria-expanded={resolvedMenuOpen}
            aria-label="Account menu"
          >
            {resolvedUserInitials}
          </button>
          {resolvedMenu}
        </div>
      </div>
    </nav>
  );
};
