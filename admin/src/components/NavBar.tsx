import React from "react";
import "./NavBar.css";
import Logo from "../../icons/logo.svg";

interface NavBarProps {
  userInitials?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  userInitials = "L", // Defaults to the 'L' from design
  tabs = [],
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={Logo} alt="Fulcrum Logo" />
      </div>

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
        <div className="user-avatar">{userInitials}</div>
      </div>
    </nav>
  );
};
