import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export function Alert({
  type = "info",
  title = null,
  message,
  onClose = null,
  style = {},
}) {
  if (!message) return null;

  const icons = {
    danger: AlertCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const IconComponent = icons[type] || Info;

  return (
    <div className={`alert alert-${type}`} style={style}>
      <IconComponent size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{title}</div>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            opacity: 0.7,
            padding: 0,
            display: "flex",
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
