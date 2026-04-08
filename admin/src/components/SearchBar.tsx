/**
 * <SearchBar
 * value={searchValue}
 * onChange={setSearchValue}
 * placeholder="Search activities..."
 * />
 */

import React, { useState, useEffect } from "react";
import "./SearchBar.css";
import SearchIcon from "../../icons/search.svg";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search activities",
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, debounceMs, onChange]);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="searchbar-container">
      <img
        src={SearchIcon}
        alt=""
        aria-hidden="true"
      />
      <input
        type="text"
        className="searchbar-input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};
