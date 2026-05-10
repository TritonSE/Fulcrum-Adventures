import Toast from "react-native-toast-message";

export type ToastKind = "success" | "error" | "info";

const DEFAULT_TOAST_TITLE: Record<ToastKind, string> = {
  success: "Success",
  error: "Error",
  info: "Notice",
};

export const showToast = (kind: ToastKind, message: string, title = DEFAULT_TOAST_TITLE[kind]) => {
  Toast.show({
    type: kind,
    text1: title,
    text2: message,
    visibilityTime: 4000,
  });
};

export const useNotifications = () => {
  const showNotificationToast = (type: ToastKind, title: string, message: string) => {
    showToast(type, message, title);
  };

  return { showToast: showNotificationToast };
};
