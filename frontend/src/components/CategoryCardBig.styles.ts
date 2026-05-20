import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    aspectRatio: 1, // Makes the card square
    justifyContent: "space-between",
    overflow: "hidden", // Keeps the image inside the rounded corners

    // Shadow properties for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,

    // Default width if not constrained by parent, but usually parent grid handles it
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    position: "absolute",
    fontSize: 20,
    fontWeight: "bold",
    zIndex: 1, // Ensure text is above the image if they overlap
    fontFamily: "League Spartan",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
});
