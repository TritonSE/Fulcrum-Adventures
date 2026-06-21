import React from "react";
import "./Button.css";

import UploadPrimaryIcon from "../../icons/upload-primary.svg";
import UploadIcon from "../../icons/upload.svg";
import UploadDisabledIcon from "../../icons/upload-disabled.svg";

export type ButtonVariant =
  | "primary"
  | "secondary-left"
  | "secondary-right"
  | "tertiary";

interface ButtonProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  showIcon?: boolean;
  icon?: string;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  fullWidth?: boolean;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  disabled = false,
  showIcon = true,
  icon,
  onClick,
  children,
  type = "button",
  className = "",
  fullWidth = false,
  ariaLabel,
}) => {
  // determine which SVG to use
  if (!icon) {
    icon = UploadIcon;
    if (disabled) {
      icon = UploadDisabledIcon;
    } else if (variant === "primary") {
      icon = UploadPrimaryIcon;
    }
  }

  // determine icon placement AND if it should be displayed at all
  const showLeftIcon =
    showIcon && (variant === "primary" || variant === "secondary-left");
  const showRightIcon =
    showIcon && (variant === "tertiary" || variant === "secondary-right");

  const buttonClasses = [
    "button",
    `button--${variant}`,
    disabled && "button--disabled",
    fullWidth && "button--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {showLeftIcon && (
        <span className="button__icon button__icon--left">
          <img src={icon} alt="" aria-hidden="true" />
        </span>
      )}

      <span className="button__text">{children}</span>

      {showRightIcon && (
        <span className="button__icon button__icon--right">
          <img src={icon} alt="" aria-hidden="true" />
        </span>
      )}
    </button>
  );
};
