import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import BackArrowIconSimple from "../../assets/BackArrowIconSimple.svg";

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "transparent",
  },
  headerBackground: {
    width: "100%",
    height: 132,
    experimental_backgroundImage: "linear-gradient(90deg, #153A7A 0%, #276BE0 100%)",
    paddingTop: 76,
    paddingBottom: 16,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 10,
  },
  arrowIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "League Spartan",
    fontSize: 26,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "center",
  },
  blurbContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  blurbText: {
    fontFamily: "Instrument Sans",
    fontSize: 14,
    color: "#153A7A",
    lineHeight: 22,
    fontWeight: "400",
  },
});

// Defining the blurbs based on section name
const blurbs: Record<string, string> = {
  Popular:
    "The most played and clicked activities on the app—these community favorites are tried, tested, and loved for keeping the energy high!",
  Recommended:
    "Our top picks to help you get started—staff selected activities designed to spark connection and get your group engaged!",
};

export function HomePopUpPageHeaderSection({
  sectionName,
}: {
  sectionName: string;
  rightPadding?: number; // Optional now that we centered everything
}) {
  return (
    <View style={styles.wrapper}>
      {/* BLUE HEADER PART */}
      <View style={styles.headerBackground}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={20}>
            <View style={styles.arrowIcon}>
              <BackArrowIconSimple />
            </View>
          </Pressable>

          <Text style={styles.title} numberOfLines={1}>
            {sectionName}
          </Text>
        </View>
      </View>

      {blurbs[sectionName] && (
        <View style={styles.blurbContainer}>
          <Text style={styles.blurbText}>{blurbs[sectionName]}</Text>
        </View>
      )}
    </View>
  );
}
