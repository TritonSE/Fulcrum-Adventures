import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// import Toast from "react-native-toast-message";
import { useNotifications } from "../hooks/useNotifications";

export function HomeMailingListSection() {
  const { showToast } = useNotifications();

  const [email, setEmail] = useState("");

  // ---start: handle sign up after user press the signup button---
  const [status, setStatus] = useState("idle"); // idle, success, user_error_duplicate, loading

  const handleSignUp = async () => {
    setStatus("loading");
    try {
      const responseExists = await fetch("http://192.168.50.151:4000/api/email/exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ req_email: email }),
      });
      if (!responseExists.ok) throw new Error("server cannot check email existence");

      const dataExists = (await responseExists.json()) as { exists_email: boolean };
      if (dataExists.exists_email === true) {
        setStatus("user_error_duplicate");
        showToast("error", "you already registered", "");
        return;
      }

      const responseCreate = await fetch("http://192.168.50.151:4000/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email }),
      });

      if (!responseCreate.ok) throw new Error("server cannot create email");

      showToast("success", "email created", "");
      setStatus("success");
    } catch (error) {
      const err_msg = error instanceof Error ? error.message : "unkown err";
      console.log(err_msg);
      showToast("error", "signup err", err_msg);
      setStatus("idle");
    }
  };
  // ---end: handle sign up after user press the signup button---

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Join Our Mailing List!</Text>
        <Text style={styles.subtitle}>
          Get more activities, guides, and tips sent straight to your inbox!
        </Text>

        <TextInput
          placeholder="Enter email here"
          placeholderTextColor="#B4B4B4"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        {status === "user_error_duplicate" && (
          <Text style={styles.duplicate_email}> This email is already registered</Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open mailing list signup"
          style={styles.button}
          onPress={() => {
            void handleSignUp();
          }}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 28,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    textAlign: "center",
    color: "#153F7A",
    fontFamily: "League Spartan",
    fontSize: 20,
    lineHeight: 20.8,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    marginTop: 12,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#B4B4B4",
    backgroundColor: "#FFFFFF",
    textAlign: "left",
    color: "#484848",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    paddingHorizontal: 12,
  },
  button: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#163F7A",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Instrument Sans",
    fontSize: 16,
    lineHeight: 44,
    fontWeight: "400",
  },
  duplicate_email: {
    color: "#EF4444",
    fontSize: 14,
    letterSpacing: 0.28,
    fontFamily: "Instrument Sans",
  },
});
