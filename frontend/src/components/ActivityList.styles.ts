// src/components/ActivityList.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  headerText: {
    color: "#153F7A",
    fontFamily: "League Spartan",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 26,
  },
  verticalList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  horizontalList: {
    paddingHorizontal: 24,
    gap: 6,
  },
});
