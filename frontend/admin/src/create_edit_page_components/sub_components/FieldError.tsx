import React from "react";
import { StyleSheet, Text, View } from "react-native";

type FieldErrorProps = {
  message: string;
};

export const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>▲</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 14,
    color: "#E55C4D",
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    color: "#E55C4D",
  },
});
