// import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text } from "react-native";

export function SeeAll({ screen, section }: { screen: string; section?: string }) {
  return (
    <Pressable>
      <Text style={styles.text}>
        {" "}
        See All → {screen} - {section}{" "}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "#909090",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: 21,
    letterSpacing: 0.28,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
  },
});
