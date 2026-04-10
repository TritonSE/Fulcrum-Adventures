import React, { useEffect } from "react";
import "./Toast.css";
import CheckIcon from "../../icons/check.svg";

interface ToastProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number; // default 3000ms
}

export const Toast: React.FC<ToastProps> = ({
  message,
  actionText,
  onAction,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-overlay">
      <div className="toast-container">
        <div className="toast-content">
          <div className="toast-icon">
            <img src={CheckIcon} alt="Check" />
          </div>
          <span className="toast-message">{message}</span>
        </div>

        {actionText && (
          <button className="toast-action" onClick={onAction}>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};
