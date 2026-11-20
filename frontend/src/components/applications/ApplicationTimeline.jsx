import React from "react";
import { formatAddress, formatTimestamp } from "../../blockchain/blockchainUtils";
import { ValidationBadge } from "../common/Badge";
import { Button } from "../common/Button";
import { ROLES, VALIDATION_STATUS } from "../../blockchain/contractConfig";
import {
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  CornerDownRight,
  Send,
} from "lucide-react";

export function ApplicationTimeline({
  application,
  isOwner = false,
  onRequestSupplementary = null,
  onOpenResubmit = null,
  loadingAction = false,
}) {
  if (!application) return null;

  const {
    id,
    coveredArea,
    employeeCount,
    municipality,
    civilProtection,
    taxOffice,
    rne,
    cnss,
  } = application;

  const isTaxEligible =
    municipality.status === VALIDATION_STATUS.APPROVED &&
    civilProtection.status === VALIDATION_STATUS.APPROVED;

  const isCompletedMain = taxOffice.status === VALIDATION_STATUS.APPROVED;

  const steps = [
    {
      role: ROLES.MUNICIPALITY,
      title: "1. Municipalité",
      subtitle: "Conformité de l'emplacement et urbanisme",
      icon: Building2,
      validation: municipality,
      isRequired: true,
      canResubmit: isOwner && municipality.status === VALIDATION_STATUS.REJECTED,
      canRequest: false,
    },
    {
      role: ROLES.CIVIL_PROTECTION,
      title: "2. Protection Civile",
      subtitle: "Sécurité incendie et normes de prévention",
      icon: ShieldCheck,
      validation: civilProtection,
      isRequired: true,
      canResubmit: isOwner && civilProtection.status === VALIDATION_STATUS.REJECTED,
      canRequest: false,
    },
    {
      role: ROLES.TAX_OFFICE,
      title: "3. Recette des Finances",
      subtitle: "Clôture de la certification principale",
      icon: FileSpreadsheet,
      validation: taxOffice,
      isRequired: true,
      dependencyInfo: !isTaxEligible
        ? "Accessible uniquement après approbation conjointe de la Municipalité et de la Protection civile."
        : null,
      canResubmit:
        isOwner &&
        taxOffice.status === VALIDATION_STATUS.REJECTED &&
        isTaxEligible,
      canRequest: false,
    },
    {
      role: ROLES.RNE,
      title: "4. Registre National des Entreprises (RNE)",
      subtitle: "Démarche complémentaire facultative d'immatriculation",
      icon: FileText,
      validation: rne,
      isRequired: false,
      isComplementary: true,
      canRequest:
        isOwner &&
        isCompletedMain &&
        rne.status === VALIDATION_STATUS.NOT_REQUESTED,
      canResubmit: isOwner && rne.status === VALIDATION_STATUS.REJECTED,
      requirementInfo: !isCompletedMain
        ? "Disponible uniquement après validation fiscale favorable."
        : null,
    },
    {
      role: ROLES.CNSS,
      title: "5. Sécurité Sociale (CNSS)",
      subtitle: "Démarche complémentaire facultative pour le personnel",
      icon: Users,
      validation: cnss,
      isRequired: false,
      isComplementary: true,
      canRequest:
        isOwner &&
        isCompletedMain &&
        employeeCount > 0 &&
        cnss.status === VALIDATION_STATUS.NOT_REQUESTED,
      canResubmit: isOwner && cnss.status === VALIDATION_STATUS.REJECTED,
      requirementInfo: !isCompletedMain
        ? "Disponible après validation fiscale favorable."
        : employeeCount === 0
        ? "Non applicable car 0 employé déclaré lors de la création du dossier."
        : null,
    },
  ];

  const getStepStatusClass = (status) => {
    switch (status) {
      case VALIDATION_STATUS.APPROVED:
        return "approved";
      case VALIDATION_STATUS.REJECTED:
        return "rejected";
      case VALIDATION_STATUS.PENDING:
        return "pending";
      default:
        return "not-requested";
    }
  };

  const getMarkerIcon = (status) => {
    switch (status) {
      case VALIDATION_STATUS.APPROVED:
        return <CheckCircle2 size={16} />;
      case VALIDATION_STATUS.REJECTED:
        return <XCircle size={16} />;
      case VALIDATION_STATUS.PENDING:
        return <Clock size={16} />;
      default:
        return <MinusCircle size={16} />;
    }
  };

  return (
    <div className="timeline">
      {steps.map((step) => {
        const { validation } = step;
        const statusClass = getStepStatusClass(validation.status);
        const IconComponent = step.icon;

        return (
          <div key={step.role} className={`timeline-step ${statusClass}`}>
            <div className="timeline-marker">
              {getMarkerIcon(validation.status)}
            </div>

            <div className="timeline-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <IconComponent size={20} color="var(--primary)" />
                  <div>
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--secondary)",
                      }}
                    >
                      {step.title}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {step.subtitle}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {step.isComplementary && (
                    <span
                      style={{
                        fontSize: "0.725rem",
                        backgroundColor: "#f1f5f9",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      Facultatif
                    </span>
                  )}
                  <ValidationBadge status={validation.status} />
                </div>
              </div>

              {/* Détails de la décision si disponible */}
              {validation.decidedBy && (
                <div
                  style={{
                    fontSize: "0.825rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    gap: "1.25rem",
                    flexWrap: "wrap",
                    marginTop: "0.5rem",
                    paddingTop: "0.5rem",
                    borderTop: "1px dashed var(--border-color)",
                  }}
                >
                  <div>
                    <strong>Validateur :</strong>{" "}
                    <span style={{ fontFamily: "monospace" }}>
                      {formatAddress(validation.decidedBy, 5)}
                    </span>
                  </div>
                  <div>
                    <strong>Date de décision :</strong>{" "}
                    {formatTimestamp(validation.decidedAt)}
                  </div>
                  {validation.attempts > 1 && (
                    <div>
                      <strong>Tentatives :</strong> {validation.attempts}
                    </div>
                  )}
                </div>
              )}

              {/* Rejet et motif */}
              {validation.status === VALIDATION_STATUS.REJECTED && (
                <div
                  style={{
                    backgroundColor: "var(--danger-bg)",
                    border: "1px solid var(--danger-border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem 1rem",
                    marginTop: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <strong style={{ color: "var(--danger-text)" }}>
                    Motif du refus notifié :
                  </strong>
                  <p
                    style={{
                      color: "var(--danger-text)",
                      marginTop: "0.25rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    « {validation.rejectionReason} »
                  </p>
                </div>
              )}

              {/* Note de correction */}
              {validation.correctionNote && (
                <div
                  style={{
                    backgroundColor: "var(--info-bg)",
                    border: "1px solid var(--info-border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem 1rem",
                    marginTop: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      color: "var(--info-text)",
                      fontWeight: 600,
                    }}
                  >
                    <CornerDownRight size={14} /> Note de correction transmise par
                    l'entrepreneur :
                  </div>
                  <p
                    style={{
                      color: "var(--text-main)",
                      marginTop: "0.25rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {validation.correctionNote}
                  </p>
                </div>
              )}

              {/* Condition bloquante ou informative */}
              {(step.dependencyInfo || step.requirementInfo) &&
                validation.status === VALIDATION_STATUS.NOT_REQUESTED && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      backgroundColor: "#f8fafc",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                      marginTop: "0.6rem",
                      fontStyle: "italic",
                    }}
                  >
                    ℹ️ {step.dependencyInfo || step.requirementInfo}
                  </div>
                )}

              {/* Bouton d'action pour l'entrepreneur */}
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                {step.canResubmit && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Send}
                    onClick={() => onOpenResubmit && onOpenResubmit(step.role, step.title)}
                    loading={loadingAction}
                  >
                    Soumettre une note de correction
                  </Button>
                )}

                {step.canRequest && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={() =>
                      onRequestSupplementary && onRequestSupplementary(step.role)
                    }
                    loading={loadingAction}
                  >
                    Demander cette validation complémentaire
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
