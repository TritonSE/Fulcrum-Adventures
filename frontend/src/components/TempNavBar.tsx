import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: "#5e6bcb",
    display: "flex",
    height: 65, // TODO: remove this, just for testing before adding icons
    width: 390,
    flexDirection: "column",
    alignItems: "flex-start",
  },
});

export function TempNavBar() {
  return (
    <View style={styles.navBar}>
      <Text>NavBar</Text>
    </View>
  );
}
