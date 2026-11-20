import React from "react";
import { Link } from "react-router-dom";
import { formatTimestamp, formatAddress } from "../../blockchain/blockchainUtils";
import { MainStatusBadge, ValidationBadge } from "../common/Badge";
import { Button } from "../common/Button";
import { Coffee, MapPin, Maximize2, Users, Calendar, ArrowRight } from "lucide-react";

export function ApplicationCard({ application, reviewMode = false, onReview = null }) {
  if (!application) return null;

  const {
    id,
    owner,
    cafeName,
    establishmentAddress,
    coveredArea,
    employeeCount,
    createdAt,
    mainStatus,
    municipality,
    civilProtection,
    taxOffice,
    rne,
    cnss,
  } = application;

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            #{id}
          </div>
          <div>
            <h3
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--secondary)",
              }}
            >
              {cafeName}
            </h3>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <MapPin size={14} /> {establishmentAddress}
            </div>
          </div>
        </div>

        <div>
          {mainStatus !== null && <MainStatusBadge status={mainStatus} />}
        </div>
      </div>

      {/* Metadata */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.75rem",
          backgroundColor: "#f8fafc",
          padding: "0.75rem 1rem",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.825rem",
          marginBottom: "1rem",
        }}
      >
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>
            Surface couverte :
          </span>
          <strong>{coveredArea} m²</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>
            Employés déclarés :
          </span>
          <strong>{employeeCount}</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>
            Date de création :
          </span>
          <span>{formatTimestamp(createdAt)}</span>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>
            Demandeur :
          </span>
          <span style={{ fontFamily: "monospace" }}>{formatAddress(owner, 4)}</span>
        </div>
      </div>

      {/* État des validations */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            fontSize: "0.8rem",
          }}
        >
          <span style={{ color: "var(--text-muted)", marginRight: "0.25rem" }}>
            Validations :
          </span>
          <span>Muni: <ValidationBadge status={municipality.status} /></span>
          <span>Prot. Civ: <ValidationBadge status={civilProtection.status} /></span>
          <span>Fisc: <ValidationBadge status={taxOffice.status} /></span>
        </div>

        <div>
          {reviewMode ? (
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onReview && onReview(application)}
            >
              Examiner & Décider
            </Button>
          ) : (
            <Link
              to={`/applications/${id}`}
              className="btn btn-outline btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              <span>Consulter le dossier</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
