import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  icon: Icon = null,
  className = "",
  style = {},
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      style={style}
    >
      {loading ? (
        <LoadingSpinner size="sm" color={variant === "primary" || variant === "danger" || variant === "success" ? "white" : "primary"} />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}
