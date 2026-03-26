import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between", // Matches Figma "Auto" spacing
    alignItems: "center",
    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",

    paddingHorizontal: 40,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,

    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  iconContainer: {
    marginBottom: 6,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: "Instrument Sans",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    lineHeight: 12,
  },
});
