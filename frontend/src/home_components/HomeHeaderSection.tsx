import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import Header from "../../assets/FulcrumLogo.svg";

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 115,
    alignSelf: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 57,
  },
});

export const HomeHeaderSection = () => {
  return (
    <LinearGradient
      colors={["#153A7A", "#276BE0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.header}
    >
      <View style={styles.logoWrapper}>
        <Header height={39} width={130} />
      </View>
    </LinearGradient>
  );
};
