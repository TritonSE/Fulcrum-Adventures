//TODO: delete this file after NavBar is implemented
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: "#5e6bcb",
    display: "flex",
    height: 65,
    width: 390,
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 20,
  },
});

export function TempNavBar() {
  return (
    <View style={styles.navBar}>
      <Text>NavBar</Text>
    </View>
  );
}
