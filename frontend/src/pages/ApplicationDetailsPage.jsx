import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { useNotification } from "../hooks/useNotification";
import {
  getApplication,
  resubmitRejectedValidation,
  requestSupplementaryValidation,
  getAttachments,
} from "../services/applicationService";
import { parseBlockchainError, formatAddress, formatTimestamp } from "../blockchain/blockchainUtils";
import { ROLES, CONTRACT_ADDRESS } from "../blockchain/contractConfig";
import { MainStatusBadge } from "../components/common/Badge";
import { ApplicationTimeline } from "../components/applications/ApplicationTimeline";
import { ApplicationProgressBar } from "../components/applications/ApplicationProgressBar";
import { AttachmentList } from "../components/attachments/AttachmentList";
import { AttachmentUploadModal } from "../components/attachments/AttachmentUploadModal";
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
  Copy,
  Check,
  Paperclip,
} from "lucide-react";

export function ApplicationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, role } = useWallet();
  const { notifySuccess, notifyError } = useNotification();

  const [application, setApplication] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Modal Upload Pièce Jointe
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

      // Charger les pièces jointes
      setLoadingAttachments(true);
      const atts = await getAttachments(Number(id));
      setAttachments(atts);
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setLoading(false);
      setLoadingAttachments(false);
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

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    notifySuccess(`Copié dans le presse-papier : ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
      notifySuccess("Note de correction transmise avec succès ! L'organisme réexaminera la demande.");
      setResubmitData(null);
      setCorrectionNote("");
      await loadDetails();
    } catch (err) {
      const errMsg = parseBlockchainError(err);
      setError(errMsg);
      notifyError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSupplementary = async (orgRole) => {
    setError(null);
    try {
      await requestSupplementaryValidation(application.id, orgRole);
      notifySuccess("Validation complémentaire demandée avec succès !");
      await loadDetails();
    } catch (err) {
      const errMsg = parseBlockchainError(err);
      setError(errMsg);
      notifyError(errMsg);
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
            Seul le propriétaire du dossier, un organisme instructeur autorisé ou l'administrateur
            du système peut consulter cette demande.
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
              position: "relative",
            }}
          >
            #{application.id}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
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

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadDetails}
            loading={loading}
          >
            Actualiser
          </Button>
          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              icon={Paperclip}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Ajouter une pièce jointe
            </Button>
          )}
        </div>
      </div>

      {/* Notifications locales */}
      {error && (
        <Alert
          type="danger"
          message={error}
          onClose={() => setError(null)}
          style={{ marginBottom: "1.25rem" }}
        />
      )}

      {/* Barre de progression visuelle */}
      <ApplicationProgressBar application={application} />

      {/* Grille : Détails & Timeline */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
          marginBottom: "1.5rem",
        }}
      >
        {/* Colonne informations administratives */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h3 className="card-title">
              <Coffee size={20} color="var(--primary)" />
              Informations déclarées
            </h3>
            <button
              onClick={() => handleCopy(String(application.id), "appId")}
              className="btn btn-outline btn-sm"
              style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
              title="Copier l'identifiant du dossier"
            >
              {copiedField === "appId" ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
              <span>ID #{application.id}</span>
            </button>
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                <code style={{ fontSize: "0.825rem", wordBreak: "break-all" }}>
                  {application.owner}
                </code>
                <button
                  onClick={() => handleCopy(application.owner, "owner")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                  title="Copier l'adresse"
                >
                  {copiedField === "owner" ? <Check size={14} color="var(--success)" /> : <Copy size={14} color="var(--text-muted)" />}
                </button>
              </div>
              {isOwner && (
                <span className="badge badge-blue" style={{ marginTop: "0.4rem" }}>
                  Vous êtes le propriétaire du dossier
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
                <span>{isAdmin ? "Administrateur" : isOwner ? "Entrepreneur" : "Organisme"}</span>
              </div>
            </div>

            <div className="alert alert-info" style={{ fontSize: "0.8rem", margin: 0, alignItems: "center" }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <span>Smart Contract :</span>
                <code>{formatAddress(CONTRACT_ADDRESS, 5)}</code>
                <button
                  onClick={() => handleCopy(CONTRACT_ADDRESS, "contract")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                  title="Copier l'adresse du contrat"
                >
                  {copiedField === "contract" ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Timeline des validations */}
        <div className="card" style={{ marginBottom: 0 }}>
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

      {/* SECTION PIÈCES JOINTES ET TRAÇABILITÉ SHA-256 */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Paperclip size={20} color="var(--primary)" />
              Pièces justificatives & Certificats d'intégrité SHA-256
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Fichiers stockés localement sur le serveur et empreintes cryptographiques enregistrées sur le Smart Contract
            </p>
          </div>
        </div>

        <AttachmentList
          attachments={attachments}
          loading={loadingAttachments}
          canUpload={isOwner}
          onOpenUpload={() => setIsUploadModalOpen(true)}
        />
      </div>

      {/* Modal d'upload de pièce jointe */}
      {isUploadModalOpen && (
        <AttachmentUploadModal
          applicationId={application.id}
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onAttachmentAdded={loadDetails}
        />
      )}

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
