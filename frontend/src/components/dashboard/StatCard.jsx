import React from "react";

export function StatCard({ title, value, icon: Icon, color = "#2563eb", bg = "#eff6ff" }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bg, color }}>
        <Icon size={24} />
      </div>
      <div>
        <div className="stat-value" style={{ color: "var(--secondary)" }}>
          {value}
        </div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );
}
