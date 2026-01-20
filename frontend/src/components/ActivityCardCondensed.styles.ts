import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 16,
    width: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 16,
    overflow: "visible",
  },
  innerContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    width: "100%",
    height: 128,
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
    paddingHorizontal: 16,
    marginTop: 16,
  },
  title: {
    fontFamily: "League Spartan",
    fontSize: 20,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 4,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "nowrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: "Instrument Sans",
    fontSize: 10,
    color: "#153A7A",
    fontWeight: "400",
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
    paddingHorizontal: 16, // Same padding as content,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    fontFamily: "Instrument Sans",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    // Shadow matching the Figma
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
