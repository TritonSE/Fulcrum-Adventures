// src/components/ActivityList.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
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
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  horizontalList: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  statusContainer: {
    flex: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  statusText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  retryText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans Medium",
    fontSize: 14,
    lineHeight: 21,
    textDecorationLine: "underline",
  },
  inlineStatusContainer: {
    marginHorizontal: 24,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F3F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  inlineStatusText: {
    flex: 1,
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 12,
    lineHeight: 18,
  },
  inlineRetryText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans Medium",
    fontSize: 12,
    lineHeight: 18,
    textDecorationLine: "underline",
  },
});
