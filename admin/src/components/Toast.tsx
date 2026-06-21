import React, { useEffect, useRef } from "react";
import "./Toast.css";
import CheckIcon from "../../icons/check.svg";
import ErrorIcon from "../../icons/error.svg";

export type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = "success",
  actionText,
  onAction,
  onClose,
  duration = 4000,
}) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const showAction = variant === "success" && actionText;

  return (
    <div className="toast-overlay">
      <div className={`toast-container toast-container--${variant}`}>
        <div className="toast-content">
          <div className="toast-icon">
            <img src={variant === "error" ? ErrorIcon : CheckIcon} alt="" aria-hidden="true" />
          </div>
          <span className="toast-message">{message}</span>
        </div>

        {showAction && (
          <button type="button" className="toast-action" onClick={onAction}>
            {actionText}
          </button>
        )}

        {variant === "error" && (
          <button
            type="button"
            className="toast-close"
            onClick={onClose}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
