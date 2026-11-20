import React from "react";
import { getValidationStatusInfo, getMainStatusInfo } from "../../utils/statusUtils";
import { getRoleInfo } from "../../utils/roleUtils";

export function ValidationBadge({ status }) {
  const info = getValidationStatusInfo(status);
  return (
    <span className={`badge ${info.badgeClass}`}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: info.color,
          display: "inline-block",
        }}
      />
      {info.label}
    </span>
  );
}

export function MainStatusBadge({ status }) {
  const info = getMainStatusInfo(status);
  return (
    <span className={`badge ${info.badgeClass}`}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: info.color,
          display: "inline-block",
        }}
      />
      {info.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const info = getRoleInfo(role);
  return (
    <span className={`badge ${info.badgeClass}`}>
      {info.shortName}
    </span>
  );
}
