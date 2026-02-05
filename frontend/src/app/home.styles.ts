import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    width: "500%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  browseText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#153F7A",
    marginTop: 20,
    lineHeight: 27,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  scrollContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
    flexGrow: 0,
    height: 150,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  emptyText: {
    color: "#B4B4B4",
    textAlign: "center",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 21,
    letterSpacing: 0.28,
    marginTop: 20,
  },
});
