import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "stretch",

    // Elevation/Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,

    height: 144,
  },
  imageContainer: {
    width: 112,
    height: 112,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#E8E8E8",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E8E8E8",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },

  // Wrapper for Title + Meta
  headerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  title: {
    fontFamily: "League Spartan",
    fontSize: 20,
    fontWeight: "700",
    color: "#153A7A",
    lineHeight: 21,
    marginBottom: 0,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: "Instrument Sans",
    fontSize: 10,
    fontWeight: "400",
    color: "#153A7A",
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  metaDivider: {
    marginHorizontal: 6,
    color: "#153A7A",
    fontSize: 10,
    fontWeight: "900",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTag: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 8,

    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Instrument Sans",
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",

    // Shadow: 0 0 4px rgba(0,0,0,0.20)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
