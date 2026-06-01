import React, { type RefObject } from "react";
import "./NavBar.css";
import Logo from "../../icons/logo.svg";

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

export const NavBar: React.FC<NavBarProps> = ({
  userInitials = "L",
  tabs = [],
  activeTab,
  onTabChange,
  onLogoClick,
  avatarRef,
  onAvatarClick,
  menuOpen = false,
  menu,
}) => {
  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-logo"
        onClick={onLogoClick}
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
        <div className="navbar-user-menu-anchor" ref={avatarRef}>
          <button
            type="button"
            className={`user-avatar ${menuOpen ? "user-avatar--open" : ""}`}
            onClick={onAvatarClick}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            {userInitials}
          </button>
          {menu}
        </div>
      </div>
    </nav>
  );
};
