import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import {
  getApplication,
  resubmitRejectedValidation,
  requestSupplementaryValidation,
} from "../services/applicationService";
import { parseBlockchainError, formatAddress, formatTimestamp } from "../blockchain/blockchainUtils";
import { ROLES, CONTRACT_ADDRESS } from "../blockchain/contractConfig";
import { MainStatusBadge } from "../components/common/Badge";
import { ApplicationTimeline } from "../components/applications/ApplicationTimeline";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Alert } from "../components/common/Alert";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import {
  ArrowLeft,
  Coffee,
  MapPin,
  Maximize2,
  Users,
  Calendar,
  Send,
  RefreshCw,
  Info,
  ShieldCheck,
} from "lucide-react";

export function ApplicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, role } = useWallet();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal Resoumission
  const [resubmitData, setResubmitData] = useState(null); // { orgRole, orgName }
  const [correctionNote, setCorrectionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getApplication(Number(id));
      setApplication(data);
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const isOwner =
    account &&
    application &&
    application.owner.toLowerCase() === account.toLowerCase();

  const isAdmin = role === ROLES.ADMIN;

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!correctionNote.trim()) {
      setError("La note de correction est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await resubmitRejectedValidation(
        application.id,
        resubmitData.orgRole,
        correctionNote
      );
      setSuccessMsg(
        `Note de correction transmise avec succès ! L'organisme réexaminera la demande.`
      );
      setResubmitData(null);
      setCorrectionNote("");
      await loadDetails();
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSupplementary = async (orgRole) => {
    setError(null);
    try {
      await requestSupplementaryValidation(application.id, orgRole);
      setSuccessMsg(`Validation complémentaire demandée avec succès !`);
      await loadDetails();
    } catch (err) {
      setError(parseBlockchainError(err));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <LoadingSpinner size="lg" text="Chargement du dossier depuis le Smart Contract..." />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <Alert type="danger" message={error} />
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Seul le propriétaire du dossier ou l'administrateur du système peut consulter
            l'intégralité de cette demande.
          </p>
          <Button variant="primary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Retourner au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div>
      {/* Navigation retour */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <ArrowLeft size={16} />
          <span>Retour</span>
        </button>
      </div>

      {/* Header du dossier */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.25rem",
            }}
          >
            #{application.id}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <h1
                style={{
                  fontSize: "1.65rem",
                  fontWeight: 800,
                  color: "var(--secondary)",
                }}
              >
                {application.cafeName}
              </h1>
              {application.mainStatus !== null && (
                <MainStatusBadge status={application.mainStatus} />
              )}
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginTop: "0.2rem",
              }}
            >
              <MapPin size={15} /> {application.establishmentAddress}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={loadDetails}
          loading={loading}
        >
          Actualiser
        </Button>
      </div>

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

      {/* Grille : Détails & Timeline */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Colonne informations administratives */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Coffee size={20} color="var(--primary)" />
              Informations déclarées
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.8rem" }}>
                Demandeur (Propriétaire) :
              </span>
              <code style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
                {application.owner}
              </code>
              {isOwner && (
                <span className="badge badge-blue" style={{ marginLeft: "0.5rem" }}>
                  Vous êtes le propriétaire
                </span>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                backgroundColor: "#f8fafc",
                padding: "0.85rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.785rem" }}>
                  Surface couverte :
                </span>
                <strong>{application.coveredArea} m²</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.785rem" }}>
                  Nombre de salariés :
                </span>
                <strong>{application.employeeCount}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.785rem" }}>
                  Date d'enregistrement :
                </span>
                <span>{formatTimestamp(application.createdAt)}</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.785rem" }}>
                  Rôle de consultation :
                </span>
                <span>{isAdmin ? "Administrateur" : "Entrepreneur"}</span>
              </div>
            </div>

            <div className="alert alert-info" style={{ fontSize: "0.8rem", margin: 0 }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <div>
                Données scellées et immuables sur le Smart Contract à l'adresse{" "}
                <code>{formatAddress(CONTRACT_ADDRESS, 5)}</code>.
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Timeline des validations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck size={20} color="var(--primary)" />
              Timeline et Décisions Administratives
            </h3>
          </div>

          <ApplicationTimeline
            application={application}
            isOwner={isOwner}
            onOpenResubmit={(orgRole, orgName) =>
              setResubmitData({ orgRole, orgName })
            }
            onRequestSupplementary={handleRequestSupplementary}
          />
        </div>
      </div>

      {/* Modal de resoumission */}
      <Modal
        isOpen={Boolean(resubmitData)}
        onClose={() => !isSubmitting && setResubmitData(null)}
        title={`Note de correction • ${resubmitData?.orgName || ""}`}
        maxWidth="550px"
      >
        <form onSubmit={handleResubmit}>
          <div className="alert alert-info" style={{ fontSize: "0.85rem" }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <div>
              Les informations de base du café étant immuables, transmettez une
              note circonstanciée justifiant des actions correctives prises pour
              lever les réserves de l'organisme.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Note explicative des corrections *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Ex: Les aménagements de sécurité ont été mis en conformité avec les prescriptions..."
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.25rem",
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setResubmitData(null)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={isSubmitting}
              icon={Send}
            >
              Transmettre la note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
