import { StyleSheet, Text, View } from "react-native";
// import { LinearGradient } from 'expo-linear-gradient';

import BackArrowIcon from "../../assets/BackArrowIcon.svg";

// usage for Popular:
// <HomePopUpPageHeaderSection sectionName="Popular" rightPadding={202} />
// usage for recommended:
// <HomePopUpPageHeaderSection sectionName="Recommended" rightPadding={91} />

export function HomePopUpPageHeaderSection({
  sectionName,
  rightPadding,
}: {
  sectionName: string;
  rightPadding: number;
}) {
  const getStyles = (rightPad: number) =>
    StyleSheet.create({
      container: {
        display: "flex",
        width: 390,
        height: 132,
        backgroundColor: "#153A7A",
        paddingTop: 76,
        paddingRight: rightPad,
        paddingBottom: 16,
        paddingLeft: 24,
        alignItems: "flex-end",
        gap: 16,
      },
      header: {
        //   width: "500%",
        //   height: 150,
        flexDirection: "row",
        gap: 16,
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
  const styles = getStyles(rightPadding);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.arrowIcon}>
          <BackArrowIcon width={24} height={24} />
        </View>
        <Text style={styles.title}>{sectionName}</Text>
      </View>
    </View>
  );
}
