import type { ToastOptions } from "../components/ToastProvider";

type ShowToastParams = {
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
};

// This will be injected by ToastProvider
let showImpl: ((opts: ToastOptions) => void) | null = null;

export const registerToast = (showFn: (opts: ToastOptions) => void) => {
  showImpl = showFn;
};

export const showToast = (message: string, options?: ShowToastParams) => {
  if (!showImpl) {
    console.warn("ToastProvider not mounted yet.");
    return;
  }

  showImpl({
    message,
    durationMs: options?.durationMs,
    actionLabel: options?.actionLabel,
    onAction: options?.onAction,
  });
};
