/**
 * <SearchBar
 * value={searchValue}
 * onChange={setSearchValue}
 * placeholder="Search activities..."
 * />
 */

import React, { useState, useEffect, useRef } from "react";
import "./SearchBar.css";
import SearchIcon from "../../icons/search.svg";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  const [localValue, setLocalValue] = useState(value);

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue]);

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
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
