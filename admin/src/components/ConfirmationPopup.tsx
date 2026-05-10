import React from "react";
import "./ConfirmationPopup.css";
import { Button } from "./Button";

interface ConfirmationPopupProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>

        <div className="popup-actions">
          <Button variant="secondary-left" onClick={onCancel} icon={false}>
            {cancelText}
          </Button>
          {/* Using a custom class for the red destructive button */}
          <Button
            variant="primary"
            className="button--destructive"
            onClick={onConfirm}
            icon={false}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
