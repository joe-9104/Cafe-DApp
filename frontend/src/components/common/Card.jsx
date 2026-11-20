import React from "react";

export function Card({ title, subtitle, extra, children, className = "", style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || extra) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                {subtitle}
              </p>
            )}
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
