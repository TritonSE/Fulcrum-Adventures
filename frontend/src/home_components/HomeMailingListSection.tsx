import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// import Toast from "react-native-toast-message";
import { useNotifications } from "../hooks/useNotifications";

export function HomeMailingListSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // "idle", "success", "user_error_duplicate", "loading" state

  const { showToast } = useNotifications();

  // ---start: handle sign up after user press the signup button---

  const handleSignUp = async () => {
    setStatus("loading");
    try {
      const exists_email_response = await fetch("http://192.168.50.151:4000/api/email/exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ req_email: email }),
      });
      if (!exists_email_response.ok) throw new Error("server could not check email");

      const exists_email_json = (await exists_email_response.json()) as { exists_email: boolean };

      if (exists_email_json.exists_email) {
        console.log("email already created");
        setStatus("user_error_duplicate");
        return;
      }

      // create the email with `email`
      const model_response_email = await fetch("http://192.168.50.151:4000/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email }),
      });

      if (!model_response_email.ok) throw new Error("server could not create new email!");

      showToast("success", "Welcome!", "Successfully joined!");
      setStatus("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "unknown error occured";
      showToast("error", "sign up error", errorMessage);
      if (error instanceof Error) console.log(error.message);
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
