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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { registerToast } from "../utils/toast";

export type ToastOptions = {
  message: string;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
  bottomOffset?: number;
};

type ToastContextType = {
  show: (opts: ToastOptions) => void;
  hide: () => void;
};
const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const DEFAULT_BOTTOM_OFFSET = 82;
  // Create once, stable across renders (avoids "ref during render" warnings)
  const [slide] = useState(() => new Animated.Value(0));
  const insets = useSafeAreaInsets();

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
          style={[
            styles.wrapper,
            {
              bottom: insets.bottom + (toast?.bottomOffset ?? DEFAULT_BOTTOM_OFFSET),
              transform: [{ translateY }],
              opacity: slide,
            },
          ]}
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
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toast: {
    backgroundColor: "#22C55E",
    width: 310,
    height: 38,
    borderRadius: 16,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    minWidth: 0,
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
    fontFamily: "InstrumentSans_700Bold",
    flexShrink: 1,
    fontSize: 14,
  },
  undoBtn: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  undoText: {
    color: "white",
    fontSize: 12,
    fontFamily: "InstrumentSans_700Bold",
  },
});
