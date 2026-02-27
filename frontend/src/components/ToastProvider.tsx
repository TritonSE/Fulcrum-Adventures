// src/components/toast/ToastProvider.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { registerToast } from "../utils/toast";

export type ToastOptions = {
  message: string;
  durationMs?: number; // default 3500
  actionLabel?: string; // e.g. "Undo"
  onAction?: () => void;
};

type ToastContextType = {
  show: (opts: ToastOptions) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  // Create once, stable across renders (avoids "ref during render" warnings)
  const [slide] = useState(() => new Animated.Value(0));

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.timing(slide, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [slide]);

  const show = useCallback(
    (opts: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setToast(opts);

      Animated.timing(slide, { toValue: 1, duration: 200, useNativeDriver: true }).start();

      const duration = opts.durationMs ?? 3500;
      timerRef.current = setTimeout(() => {
        hide();
      }, duration);
    },
    [hide, slide],
  );

  // Register global showToast() helper
  useEffect(() => {
    registerToast(show);
    return () => {
      registerToast(() => {
        // no-op after unmount
      });
    };
  }, [show]);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <ToastContext value={value}>
      {children}

      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.wrapper, { transform: [{ translateY }], opacity: slide }]}
        >
          <View style={styles.toast}>
            <View style={styles.left}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={16} color="#1F2A44" />
              </View>

              <Text style={styles.message} numberOfLines={1}>
                {toast.message}
              </Text>
            </View>

            {toast.actionLabel && toast.onAction && (
              <Pressable
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                style={({ pressed }) => [styles.undoBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.undoText}>{toast.actionLabel}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext>
  );
}

export function useToast() {
  const ctx = use(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
  toast: {
    backgroundColor: "#6BC56E",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  undoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  undoText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
});
