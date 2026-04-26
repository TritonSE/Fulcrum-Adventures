import Toast from "react-native-toast-message";

export const useNotifications = () => {
  // A generic function that handles different messages
  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    Toast.show({
      type, // 'success', 'error', or 'info'
      text1: title,
      text2: message,
      visibilityTime: 4000,
    });
  };

  return { showToast };
};
