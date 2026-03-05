import { useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type HomeMailingListSectionProps = {
  onStartSignup: () => void;
};

export function HomeMailingListSection({ onStartSignup }: HomeMailingListSectionProps) {
  const inputRef = useRef<TextInput>(null);

  const handleInputFocus = () => {
    inputRef.current?.blur();
    onStartSignup();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Join Our Mailing List!</Text>
        <Text style={styles.subtitle}>
          Get more activities, guides, and tips sent straight to your inbox!
        </Text>

        <TextInput
          ref={inputRef}
          placeholder="Enter email here"
          placeholderTextColor="#B4B4B4"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleInputFocus}
          style={styles.input}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open mailing list signup"
          onPress={onStartSignup}
          style={styles.button}
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
    textAlign: "center",
    color: "#777777",
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
});
