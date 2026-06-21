import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Header from "../../assets/FulcrumLogo.svg";

const styles = StyleSheet.create({
  header: {
    width: "100%",
    alignSelf: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export const HomeHeaderSection = () => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#153A7A", "#276BE0"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.header, { height: 115 + insets.top, marginTop: -insets.top }]}
    >
      <View style={[styles.logoWrapper, { marginTop: 57 + insets.top }]}>
        <Header height={39} width={130} />
      </View>
    </LinearGradient>
  );
};
