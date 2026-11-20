import React from "react";
import { MAIN_STATUS, VALIDATION_STATUS } from "../../blockchain/contractConfig";
import { CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";

export function ApplicationProgressBar({ application }) {
  if (!application) return null;

  const { municipality, civilProtection, taxOffice, rne, cnss, mainStatus } = application;

  const isMuniOk = municipality.status === VALIDATION_STATUS.APPROVED;
  const isCivOk = civilProtection.status === VALIDATION_STATUS.APPROVED;
  const isTaxOk = taxOffice.status === VALIDATION_STATUS.APPROVED;
  const isRneOk = rne.status === VALIDATION_STATUS.APPROVED;
  const isCnssOk = cnss.status === VALIDATION_STATUS.APPROVED;

  // Calcul du pourcentage d'avancement du cycle principal (sur 100%)
  let mainPercent = 10;
  if (isMuniOk && isCivOk) {
    mainPercent = 65;
  } else if (isMuniOk || isCivOk) {
    mainPercent = 40;
  }
  if (isTaxOk) {
    mainPercent = 100;
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        marginBottom: "1.25rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--secondary)" }}>
          Avancement administratif du dossier
        </h4>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
          {isTaxOk ? "Cycle principal clôturé (100%)" : `${mainPercent}% complété`}
        </span>
      </div>

      {/* Barre de progression principale */}
      <div
        style={{
          height: "8px",
          backgroundColor: "#e2e8f0",
          borderRadius: "9999px",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${mainPercent}%`,
            backgroundColor: isTaxOk ? "var(--success)" : "var(--primary)",
            borderRadius: "9999px",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* 3 blocs de progression */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.75rem",
          fontSize: "0.8rem",
        }}
      >
        {/* Étape 1 : Initiales */}
        <div
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: isMuniOk && isCivOk ? "var(--success-bg)" : "#f8fafc",
            border: `1px solid ${isMuniOk && isCivOk ? "var(--success-border)" : "var(--border-light)"}`,
          }}
        >
          <div style={{ fontWeight: 600, color: isMuniOk && isCivOk ? "var(--success-text)" : "var(--secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            {isMuniOk && isCivOk ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            1. Validations initiales
          </div>
          <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Muni: {municipality.status === 2 ? "✓" : municipality.status === 3 ? "✕" : "..."} • Prot. Civ: {civilProtection.status === 2 ? "✓" : civilProtection.status === 3 ? "✕" : "..."}
          </div>
        </div>

        {/* Étape 2 : Fiscale */}
        <div
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: isTaxOk ? "var(--success-bg)" : "#f8fafc",
            border: `1px solid ${isTaxOk ? "var(--success-border)" : "var(--border-light)"}`,
          }}
        >
          <div style={{ fontWeight: 600, color: isTaxOk ? "var(--success-text)" : "var(--secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            {isTaxOk ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            2. Recette des Finances
          </div>
          <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {isTaxOk ? "Certification clôturée" : isMuniOk && isCivOk ? "En attente instruction" : "En attente étapes initiales"}
          </div>
        </div>

        {/* Étape 3 : Complémentaires (Facultatives) */}
        <div
          style={{
            padding: "0.6rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "#f8fafc",
            border: "1px solid var(--border-light)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Info size={14} color="var(--primary)" />
            3. Complémentaires (Optionnel)
          </div>
          <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "2px" }}>
            RNE: {rne.status === 2 ? "✓" : rne.status === 1 ? "En cours" : "Non demandée"} • CNSS: {cnss.status === 2 ? "✓" : cnss.status === 1 ? "En cours" : "Non demandée"}
          </div>
        </div>
      </div>
    </div>
  );
}
