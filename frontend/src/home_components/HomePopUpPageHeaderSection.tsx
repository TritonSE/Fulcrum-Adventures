import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import BackArrowIcon from "../../assets/BackArrowIcon.svg";

export function HomePopUpPageHeaderSection({
  sectionName,
  rightPadding,
}: {
  sectionName: string;
  rightPadding: number;
}) {
  return (
    <View style={[styles.container, { paddingRight: rightPadding }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={20}>
          <View style={styles.arrowIcon}>
            <BackArrowIcon width={24} height={24} />
          </View>
        </Pressable>
        <Text style={styles.title}>{sectionName}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    width: "100%",
    height: 132,
    // @ts-expect-error experimental_backgroundImage is not in RN types yet
    experimental_backgroundImage: "linear-gradient(90deg, #153A7A 0%, #276BE0 100%)",
    paddingTop: 76,
    paddingBottom: 16,
    paddingLeft: 24,
    gap: 16,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  header: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  arrowIcon: {
    display: "flex",
    width: 40,
    height: 40,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    borderRadius: 100,
    backgroundColor: "#FFF",
  },
  title: {
    fontFamily: "League Spartan",
    fontSize: 32,
    fontStyle: "normal",
    fontWeight: 700,
    color: "#FFF",
  },
});
