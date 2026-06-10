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
    gap: 12,
    width: "100%",
  },
  backButton: {
    flexShrink: 0,
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
    textAlign: "left",
    flexShrink: 1,
  },
});

export function HomePopUpPageHeaderSection({
  sectionName,
}: {
  sectionName: string;
  rightPadding?: number;
}) {
  return (
    <View style={styles.wrapper}>
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
    </View>
  );
}
