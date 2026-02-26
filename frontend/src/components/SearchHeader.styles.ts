import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  searchBar: {
    display: "flex",
    flexDirection: "row",
    height: 43,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    // boxShadow: "0 0 4px 0 rgba(0, 0, 0, 0.20)", // React Native uses shadow styles, not boxShadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 8,
  },
  recentSearchesContainer: {
    display: "flex",
    alignSelf: "stretch",
  },
  recentSearchesTextContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recentSearchesChipsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
  recentSearchesChipsContentContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    paddingEnd: 16,
    paddingVertical: 8,
  },
  smallText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 21,
    letterSpacing: 0.28,
  },
  clearAllText: {
    color: "#B4B4B4",
    fontSize: 14,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
  filtersContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  filtersContentContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    paddingEnd: 16,
    paddingVertical: 8,
  },
});
