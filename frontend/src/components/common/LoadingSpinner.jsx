import React from "react";

export function LoadingSpinner({ size = "md", color = "primary", text = null }) {
  const sizeMap = {
    sm: "16px",
    md: "24px",
    lg: "36px",
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <span
        className={`spinner ${color === "white" ? "spinner-white" : ""}`}
        style={{ width: dim, height: dim }}
      />
      {text && <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{text}</span>}
    </div>
  );
}
