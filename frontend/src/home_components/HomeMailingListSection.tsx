import { useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { mailingListApi } from "../services/api";

const PRIVACY_URL = "https://fulcrum-admin-nine.vercel.app/privacy";

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
  privacyLink: {
    minHeight: 44,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyLinkText: {
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export function HomeMailingListSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const submittingRef = useRef(false);

  // Save the address to the same list staff can access in the admin portal.
  const subscribe = async () => {
    if (submittingRef.current) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setFeedback({ message: "Please enter a valid email address.", isError: true });
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await mailingListApi.subscribe(normalizedEmail);
      setEmail("");
      setFeedback({ message: "You're on the list!", isError: false });
    } catch {
      setFeedback({ message: "Unable to sign up right now. Please try again.", isError: true });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Join Our Mailing List!</Text>
        <Text style={styles.subtitle}>
          Get more activities, guides, and tips sent straight to your inbox!
        </Text>

        <TextInput
          accessibilityLabel="Email address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setFeedback(null);
          }}
          editable={!isSubmitting}
          maxLength={254}
          returnKeyType="go"
          onSubmitEditing={() => {
            void subscribe();
          }}
          placeholder="Enter email here"
          placeholderTextColor="#B4B4B4"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign up for the mailing list"
          accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
          disabled={isSubmitting}
          onPress={() => {
            void subscribe();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{isSubmitting ? "Signing up..." : "Sign up"}</Text>
        </Pressable>
        {feedback && (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.subtitle, feedback.isError && { color: "#A32121" }]}
          >
            {feedback.message}
          </Text>
        )}
        <Pressable
          accessibilityRole="link"
          accessibilityHint="Opens the privacy policy and support page in your browser"
          onPress={() => {
            void Linking.openURL(PRIVACY_URL).catch(() => {
              setFeedback({
                message: "Unable to open the privacy page. Please try again.",
                isError: true,
              });
            });
          }}
          style={styles.privacyLink}
        >
          <Text style={styles.privacyLinkText}>Privacy &amp; support</Text>
        </Pressable>
      </View>
    </View>
  );
}
