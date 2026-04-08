/**
 * <TextField
 * value={textValue}
 * onChange={setTextValue}
 *  placeholder="I am exactly 300px wide and 150px tall!"
 *  multiline
 *  width="300px"
 *  height="150px"
 * />
 */

import React, { useState } from "react";
import "./TextField.css";
import ErrorIcon from "../../icons/error.svg";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  width?: number | string;
  height?: number | string;
}

export const TextField: React.FC<TextFieldProps> = ({
  value,
  onChange,
  placeholder = "Enter text",
  error,
  maxLength,
  multiline = false,
  rows = 4,
  fullWidth = true,
  width,
  height,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerClasses = [
    "textfield-container",
    fullWidth && !width && "textfield--full-width", // Only use fullWidth if no custom width is passed
    error && "textfield--error",
    isFocused && "textfield--focused",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={containerClasses} style={{ width, height }}>
      <div className="textfield-wrapper">
        {multiline ? (
          <textarea
            className="textfield-input"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={height ? undefined : rows} // Drop the rows attribute if custom height is used
          />
        ) : (
          <input
            type="text"
            className="textfield-input"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        )}
      </div>

      {/* Footer: Error Message and/or Character Count */}
      {(error || maxLength) && (
        <div className="textfield-footer">
          <div className="textfield-error-text">
            {error && (
              <>
                <img
                  src={ErrorIcon}
                  alt=""
                  className="error-icon"
                  aria-hidden="true"
                />
                {error}
              </>
            )}
          </div>
          {maxLength && (
            <div className="textfield-char-count">
              {value.length}/{maxLength} characters
            </div>
          )}
        </div>
      )}
    </div>
  );
};
