import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// SVG Imports
import HomeFilledIcon from "../../assets/icons/home-filled.svg";
import HomeIcon from "../../assets/icons/home.svg";
import LibraryFilledIcon from "../../assets/icons/library-filled.svg";
import LibraryIcon from "../../assets/icons/library.svg";
import SearchFilledIcon from "../../assets/icons/search-filled.svg";
import SearchIcon from "../../assets/icons/search.svg";

import { styles } from "./Navbar.styles";

export type TabName = "Home" | "Search" | "Library";

type NavbarProps = {
  currentTab: TabName;
  onSwitchTab: (tab: TabName) => void;
};

type TabButtonProps = {
  tab: TabName;
  isActive: boolean;
  onPress: () => void;
};

const ACTIVE_TEXT_COLOR = "#153A7A";
const INACTIVE_TEXT_COLOR = "#909090";

const getTabIcon = (tab: TabName, isActive: boolean) => {
  switch (tab) {
    case "Home":
      return isActive ? <HomeFilledIcon /> : <HomeIcon />;
    case "Search":
      return isActive ? <SearchFilledIcon /> : <SearchIcon />;
    case "Library":
      return isActive ? <LibraryFilledIcon /> : <LibraryIcon />;
    default:
      return null;
  }
};

const TabButton: React.FC<TabButtonProps> = ({ tab, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.iconContainer}>{getTabIcon(tab, isActive)}</View>
      <Text style={[styles.label, { color: isActive ? ACTIVE_TEXT_COLOR : INACTIVE_TEXT_COLOR }]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSwitchTab }) => {
  return (
    <View style={styles.container}>
      <TabButton tab="Home" isActive={currentTab === "Home"} onPress={() => onSwitchTab("Home")} />
      <TabButton
        tab="Search"
        isActive={currentTab === "Search"}
        onPress={() => onSwitchTab("Search")}
      />
      <TabButton
        tab="Library"
        isActive={currentTab === "Library"}
        onPress={() => onSwitchTab("Library")}
      />
    </View>
  );
};
