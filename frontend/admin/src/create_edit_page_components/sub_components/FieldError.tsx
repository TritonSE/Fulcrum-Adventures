import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Vector from "../../../../assets/Vector.svg";

type FieldErrorProps = {
  message: string;
};

export const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Vector width={17} height={16} style={styles.icon} />
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
    marginRight: 6,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    fontFamily: "Instrument Sans",
    color: "#EF4444",
    marginBottom: 10,
  },
});
