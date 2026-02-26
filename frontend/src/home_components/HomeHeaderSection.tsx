import { StyleSheet, View } from "react-native";

import Header from "../../assets/Header.svg";

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const HomeHeaderSection = () => {
  return (
    <View style={styles.header}>
      <Header width={390} height={115} />
    </View>
  );
};
