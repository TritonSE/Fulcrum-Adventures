import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CloseButton from "../../assets/CloseButton.svg";

type HomeMailingListModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (email: string) => void;
};

export function HomeMailingListModal({ visible, onClose, onSubmit }: HomeMailingListModalProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    onSubmit?.(trimmedEmail);
    setEmail("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close mailing list modal"
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={12}
          >
            <CloseButton />
          </Pressable>

          <Text style={styles.title}>Join Our Mailing List!</Text>
          <Text style={styles.subtitle}>
            Get more activities, guides, and tips sent straight to your inbox!
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email here"
            placeholderTextColor="#B4B4B4"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={styles.input}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign up for mailing list"
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            <Text style={styles.submitText}>Sign up</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  card: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 10,
    zIndex: 2,
  },
  closeText: {
    fontSize: 34,
    color: "#153F7A",
    lineHeight: 34,
    fontFamily: "League Spartan",
  },
  title: {
    marginTop: 6,
    textAlign: "center",
    color: "#153F7A",
    fontFamily: "League Spartan",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 42,
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    lineHeight: 24,
  },
  input: {
    marginTop: 14,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B4B4B4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    color: "#555555",
    textAlign: "center",
    fontFamily: "Instrument Sans",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 10,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#153F7A",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontFamily: "Instrument Sans",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 16,
  },
});
