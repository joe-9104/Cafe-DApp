import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../../hooks/useWallet";
import {
  getPendingApplicationsForOrganization,
  decideValidation,
} from "../../services/applicationService";
import { parseBlockchainError, formatTimestamp, formatAddress } from "../../blockchain/blockchainUtils";
import { ValidationBadge } from "../common/Badge";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Alert } from "../common/Alert";
import { LoadingSpinner } from "../common/LoadingSpinner";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Send,
  Building,
  MapPin,
  Maximize2,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

export function OrganizationReviewDashboard({
  role,
  title,
  subtitle,
  icon: OrgIcon,
  checklistItems = [],
  roleSpecificNote = null,
}) {
  const { account } = useWallet();

  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal d'examen et décision
  const [reviewApp, setReviewApp] = useState(null);
  const [decision, setDecision] = useState("approve"); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingApplicationsForOrganization();
      setPendingApps(data);
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleOpenReview = (app) => {
    setReviewApp(app);
    setDecision("approve");
    setRejectionReason("");
    setError(null);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!reviewApp) return;

    const approved = decision === "approve";

    if (!approved && !rejectionReason.trim()) {
      setError("Le motif du rejet est obligatoire pour notifier le refus.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const { receipt } = await decideValidation(
        reviewApp.id,
        role,
        approved,
        approved ? "" : rejectionReason.trim()
      );

      setSuccessMsg(
        `Décision enregistrée avec succès sur la blockchain ! (Validation ${
          approved ? "Approuvée" : "Rejetée"
        })`
      );
      setReviewApp(null);
      await loadPending();
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <OrgIcon size={26} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "var(--secondary)",
              }}
            >
              {title}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {subtitle}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          icon={RefreshCw}
          onClick={loadPending}
          loading={loading}
        >
          Actualiser
        </Button>
      </div>

      {roleSpecificNote && (
        <div style={{ marginBottom: "1.25rem" }}>{roleSpecificNote}</div>
      )}

      {/* Notifications */}
      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={() => setError(null)}
          style={{ marginBottom: "1.25rem" }}
        />
      )}
      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
          style={{ marginBottom: "1.25rem" }}
        />
      )}

      {/* Contenu */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <LoadingSpinner size="lg" text="Recherche des dossiers en attente sur la blockchain..." />
        </div>
      ) : pendingApps.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <CheckCircle2 size={30} color="var(--success)" />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Aucun dossier en attente d'instruction
          </h3>
          <p style={{ maxWidth: "480px", margin: "0 auto", fontSize: "0.9rem" }}>
            Tous les dossiers soumis à votre organisme ont été traités ou ne requièrent
            pas d'action à ce stade.
          </p>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--secondary)",
              }}
            >
              Dossiers à instruire ({pendingApps.length})
            </h2>
            <span className="badge badge-amber">
              <Clock size={12} /> {pendingApps.length} en attente
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {pendingApps.map((app) => (
              <div key={app.id} className="card" style={{ marginBottom: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        backgroundColor: "var(--primary-light)",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      Dossier #{app.id}
                    </span>
                    <h3
                      style={{
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "var(--secondary)",
                        marginTop: "0.35rem",
                      }}
                    >
                      {app.cafeName}
                    </h3>
                  </div>
                  <span className="badge badge-amber">En attente</span>
                </div>

                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>{app.establishmentAddress}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Maximize2 size={15} color="var(--primary)" />
                    <span>Surface : <strong>{app.coveredArea} m²</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Users size={15} color="var(--primary)" />
                    <span>Employés déclarés : <strong>{app.employeeCount}</strong></span>
                  </div>
                </div>

                {/* Si resoumission avec note */}
                {app.municipality?.correctionNote && (
                  <div
                    style={{
                      backgroundColor: "var(--info-bg)",
                      border: "1px solid var(--info-border)",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <strong>Note de correction transmise :</strong>
                    <p style={{ marginTop: "0.2rem" }}>
                      {app.municipality.correctionNote}
                    </p>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  style={{ width: "100%" }}
                  onClick={() => handleOpenReview(app)}
                >
                  Examiner et prendre une décision
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal d'instruction et de décision */}
      <Modal
        isOpen={Boolean(reviewApp)}
        onClose={() => !isSubmitting && setReviewApp(null)}
        title={`Instruction du Dossier #${reviewApp?.id} • ${reviewApp?.cafeName}`}
        maxWidth="620px"
      >
        {reviewApp && (
          <form onSubmit={handleDecisionSubmit}>
            {/* Détails du projet */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Nom de l'établissement :
                  </span>
                  <strong>{reviewApp.cafeName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Demandeur (Propriétaire) :
                  </span>
                  <span style={{ fontFamily: "monospace" }}>
                    {formatAddress(reviewApp.owner, 4)}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Adresse :
                  </span>
                  <strong>{reviewApp.establishmentAddress}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Surface couverte :
                  </span>
                  <strong>{reviewApp.coveredArea} m²</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Nombre de salariés :
                  </span>
                  <strong>{reviewApp.employeeCount}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block" }}>
                    Date de dépôt :
                  </span>
                  <span>{formatTimestamp(reviewApp.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Checklist de vérification simulation */}
            {checklistItems.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Points de contrôle réglementaires :</label>
                <div
                  style={{
                    backgroundColor: "#f1f5f9",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.825rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Choix de décision */}
            <div className="form-group">
              <label className="form-label">Décision de l'organisme *</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <label
                  style={{
                    border:
                      decision === "approve"
                        ? "2px solid var(--success)"
                        : "1px solid var(--border-color)",
                    backgroundColor:
                      decision === "approve" ? "var(--success-bg)" : "white",
                    padding: "0.85rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 600,
                    color:
                      decision === "approve"
                        ? "var(--success-text)"
                        : "var(--text-main)",
                  }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="approve"
                    checked={decision === "approve"}
                    onChange={() => setDecision("approve")}
                  />
                  <CheckCircle size={18} />
                  <span>Approuver la validation</span>
                </label>

                <label
                  style={{
                    border:
                      decision === "reject"
                        ? "2px solid var(--danger)"
                        : "1px solid var(--border-color)",
                    backgroundColor:
                      decision === "reject" ? "var(--danger-bg)" : "white",
                    padding: "0.85rem",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 600,
                    color:
                      decision === "reject"
                        ? "var(--danger-text)"
                        : "var(--text-main)",
                  }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="reject"
                    checked={decision === "reject"}
                    onChange={() => setDecision("reject")}
                  />
                  <XCircle size={18} />
                  <span>Rejeter la demande</span>
                </label>
              </div>
            </div>

            {/* Motif obligatoire en cas de rejet */}
            {decision === "reject" && (
              <div className="form-group">
                <label className="form-label" style={{ color: "var(--danger-text)" }}>
                  Motif obligatoire du rejet *
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Précisez les non-conformités constatées et les corrections attendues..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
                <span className="form-help">
                  Ce motif sera consigné dans le Smart Contract et notifié à l'entrepreneur.
                </span>
              </div>
            )}

            {/* Pied du modal */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "1.5rem",
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewApp(null)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant={decision === "approve" ? "success" : "danger"}
                loading={isSubmitting}
                icon={Send}
              >
                {decision === "approve"
                  ? "Confirmer l'approbation sur Ganache"
                  : "Confirmer le rejet sur Ganache"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
