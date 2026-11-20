import React, { useState } from "react";
import { formatAddress, formatTimestamp } from "../../blockchain/blockchainUtils";
import { getDocumentTypeInfo, formatFileSize } from "../../utils/attachmentUtils";
import { verifyAttachmentIntegrity, getAttachmentDownloadUrl } from "../../services/applicationService";
import { AttachmentPreviewModal } from "./AttachmentPreviewModal";
import { Button } from "../common/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useNotification } from "../../hooks/useNotification";
import {
  FileText,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  PlusCircle,
  FileCheck,
} from "lucide-react";

export function AttachmentList({
  attachments = [],
  loading = false,
  canUpload = false,
  onOpenUpload = null,
}) {
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [verificationStates, setVerificationStates] = useState({}); // { [attachmentId]: { loading, verified, status, message } }
  const [copiedHash, setCopiedHash] = useState(null);
  const { notifySuccess, notifyError } = useNotification();

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    notifySuccess("Empreinte SHA-256 copiée dans le presse-papier !");
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleVerify = async (att) => {
    setVerificationStates((prev) => ({
      ...prev,
      [att.attachmentId]: { loading: true },
    }));

    try {
      const result = await verifyAttachmentIntegrity(att.attachmentId, att.sha256Hash);
      setVerificationStates((prev) => ({
        ...prev,
        [att.attachmentId]: {
          loading: false,
          verified: result.verified,
          status: result.status,
          message: result.message,
        },
      }));

      if (result.verified) {
        notifySuccess("Intégrité vérifiée : le document correspond exactement au hash blockchain !");
      } else {
        notifyError(result.message || "Alerte : empreinte non conforme !");
      }
    } catch (err) {
      setVerificationStates((prev) => ({
        ...prev,
        [att.attachmentId]: {
          loading: false,
          verified: false,
          status: "ERROR",
          message: "Impossible de contacter le serveur de stockage.",
        },
      }));
      notifyError("Échec de la communication avec le serveur de stockage.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <LoadingSpinner size="md" text="Chargement des pièces justificatives..." />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--secondary)" }}>
            Documents justificatifs ({attachments.length})
          </h4>
        </div>

        {canUpload && (
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={onOpenUpload}
          >
            Ajouter un document
          </Button>
        )}
      </div>

      {attachments.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "2rem 1.5rem",
            textAlign: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <FileText size={32} color="var(--text-light)" style={{ margin: "0 auto 0.5rem" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: canUpload ? "1rem" : 0 }}>
            Aucune pièce justificative n'a encore été rattachée à ce dossier.
          </p>
          {canUpload && (
            <Button
              variant="outline"
              size="sm"
              icon={PlusCircle}
              onClick={onOpenUpload}
            >
              Déposer le premier document
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {attachments.map((att, idx) => {
            const typeInfo = getDocumentTypeInfo(att.documentType);
            const verifyState = verificationStates[att.attachmentId];

            return (
              <div
                key={att.attachmentId || idx}
                style={{
                  backgroundColor: "white",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.25rem",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {/* Ligne 1 : Type, Nom et Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "#f1f5f9",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      <FileText size={20} />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span className={`badge ${typeInfo.badgeClass}`}>
                          {typeInfo.label}
                        </span>
                        <strong style={{ fontSize: "0.95rem", color: "var(--secondary)" }}>
                          {att.filename}
                        </strong>
                      </div>

                      <div
                        style={{
                          fontSize: "0.775rem",
                          color: "var(--text-muted)",
                          marginTop: "0.25rem",
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>Ajouté le : {formatTimestamp(att.uploadedAt)}</span>
                        <span>Déposant : <code>{formatAddress(att.uploadedBy, 4)}</code></span>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedPreview(att)}
                      title="Aperçu du document"
                    >
                      Aperçu
                    </Button>

                    <a
                      href={getAttachmentDownloadUrl(att.attachmentId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      title="Télécharger le fichier"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <Download size={14} />
                      <span>Télécharger</span>
                    </a>

                    <Button
                      variant={verifyState?.verified ? "success" : "outline"}
                      size="sm"
                      icon={ShieldCheck}
                      loading={verifyState?.loading}
                      onClick={() => handleVerify(att)}
                      title="Vérifier l'empreinte SHA-256 avec la blockchain"
                    >
                      {verifyState?.verified ? "Intégrité validée" : "Vérifier l'intégrité"}
                    </Button>
                  </div>
                </div>

                {/* Ligne 2 : Hash SHA-256 & État de vérification */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.785rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>SHA-256 scellé :</span>
                    <code
                      style={{
                        backgroundColor: "#f1f5f9",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "3px",
                        fontSize: "0.75rem",
                      }}
                      title={att.sha256Hash}
                    >
                      {att.sha256Hash ? `${att.sha256Hash.substring(0, 16)}...${att.sha256Hash.substring(att.sha256Hash.length - 8)}` : "Non spécifié"}
                    </code>
                    <button
                      onClick={() => handleCopyHash(att.sha256Hash)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: copiedHash === att.sha256Hash ? "var(--success)" : "var(--text-muted)",
                        padding: "2px",
                        display: "flex",
                      }}
                      title="Copier le hash SHA-256 complet"
                    >
                      {copiedHash === att.sha256Hash ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>

                  {verifyState && !verifyState.loading && (
                    <div>
                      {verifyState.verified ? (
                        <span
                          style={{
                            color: "var(--success-text)",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <CheckCircle2 size={14} color="var(--success)" />
                          Empreinte certifiée sur le Smart Contract
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "var(--danger-text)",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <AlertTriangle size={14} color="var(--danger)" />
                          {verifyState.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'aperçu */}
      {selectedPreview && (
        <AttachmentPreviewModal
          attachment={selectedPreview}
          isOpen={Boolean(selectedPreview)}
          onClose={() => setSelectedPreview(null)}
        />
      )}
    </div>
  );
}
