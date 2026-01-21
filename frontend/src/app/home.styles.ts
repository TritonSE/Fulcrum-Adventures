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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  scrollContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
});
