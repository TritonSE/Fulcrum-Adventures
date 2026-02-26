import React from "react";

import { Navbar } from "./Navbar"; // adjust import path if needed

import type { TabName } from "./Navbar";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const routeToTab: Record<string, TabName> = {
  home: "Home",
  search: "Search",
  library: "Library",
};

const tabToRoute: Record<TabName, string> = {
  Home: "home",
  Search: "search",
  Library: "library",
};

export function NavbarTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index]?.name;
  const currentTab = routeToTab[activeRouteName] ?? "Home";

  return (
    <Navbar
      currentTab={currentTab}
      onSwitchTab={(tab) => navigation.navigate(tabToRoute[tab] as never)}
    />
  );
}
