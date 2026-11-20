import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { DOCUMENT_TYPES, formatFileSize } from "../../utils/attachmentUtils";
import {
  uploadAttachmentToBackend,
  addAttachment,
  deleteUploadedAttachment,
} from "../../services/applicationService";
import { parseBlockchainError } from "../../blockchain/blockchainUtils";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export function AttachmentUploadModal({
  applicationId,
  isOpen,
  onClose,
  onAttachmentAdded,
}) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0].label);
  const [step, setStep] = useState("IDLE"); // 'IDLE' | 'UPLOADING_BACKEND' | 'WAITING_BLOCKCHAIN' | 'SUCCESS'
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }

    // Validation taille (5 Mo max)
    if (selected.size > 5 * 1024 * 1024) {
      setError("Le fichier dépasse la limite maximale autorisée de 5 Mo.");
      setFile(null);
      return;
    }

    // Validation format
    const validExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const fileExt = selected.name.substring(selected.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(fileExt)) {
      setError("Format de fichier non accepté. Seuls les formats PDF, JPG et PNG sont autorisés.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Veuillez sélectionner un document.");
      return;
    }

    setError(null);
    let uploadedBackendData = null;

    try {
      // Étape 1 : Téléversement sur le serveur Express et calcul SHA-256
      setStep("UPLOADING_BACKEND");
      uploadedBackendData = await uploadAttachmentToBackend(file, documentType);

      // Étape 2 : Enregistrement des métadonnées sur le Smart Contract
      setStep("WAITING_BLOCKCHAIN");
      await addAttachment(applicationId, {
        attachmentId: uploadedBackendData.attachmentId,
        filename: uploadedBackendData.filename,
        documentType: documentType,
        sha256Hash: uploadedBackendData.sha256,
        storageReference: uploadedBackendData.storageReference,
      });

      setStep("SUCCESS");
      setTimeout(() => {
        setStep("IDLE");
        setFile(null);
        onClose();
        if (onAttachmentAdded) onAttachmentAdded();
      }, 1500);
    } catch (err) {
      console.error("Erreur ajout pièce jointe:", err);
      // Nettoyer le fichier du backend si la transaction blockchain a été rejetée
      if (uploadedBackendData && uploadedBackendData.attachmentId) {
        await deleteUploadedAttachment(uploadedBackendData.attachmentId);
      }
      setError(parseBlockchainError(err));
      setStep("IDLE");
    }
  };

  const isProcessing = step === "UPLOADING_BACKEND" || step === "WAITING_BLOCKCHAIN";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isProcessing && onClose()}
      title="Ajouter une pièce justificative au dossier"
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        {error && <Alert type="danger" message={error} onClose={() => setError(null)} style={{ marginBottom: "1rem" }} />}

        {step === "SUCCESS" && (
          <div className="alert alert-success" style={{ alignItems: "center" }}>
            <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
            <div>
              <strong>Pièce jointe enregistrée avec succès !</strong> L'empreinte SHA-256 a été scellée sur le Smart Contract.
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Type de document justificatif *</label>
          <select
            className="form-select"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={isProcessing}
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.id} value={dt.label}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Sélectionner le fichier (PDF, JPG, PNG ≤ 5 Mo) *</label>
          <div
            style={{
              border: "2px dashed var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              textAlign: "center",
              backgroundColor: "#f8fafc",
              cursor: isProcessing ? "not-allowed" : "pointer",
            }}
            onClick={() => !isProcessing && document.getElementById("file-input").click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <UploadCloud size={36} color="var(--primary)" style={{ margin: "0 auto 0.5rem" }} />
            {file ? (
              <div>
                <div style={{ fontWeight: 600, color: "var(--secondary)" }}>{file.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatFileSize(file.size)}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, color: "var(--secondary)" }}>Cliquez pour choisir un document</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Formats acceptés : PDF, PNG, JPG (Max 5 Mo)</div>
              </div>
            )}
          </div>
        </div>

        {/* Étapes du processus */}
        {isProcessing && (
          <div
            style={{
              backgroundColor: "var(--info-bg)",
              border: "1px solid var(--info-border)",
              borderRadius: "var(--radius-sm)",
              padding: "1rem",
              marginBottom: "1rem",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {step === "UPLOADING_BACKEND" ? (
                <LoadingSpinner size="sm" color="primary" />
              ) : (
                <CheckCircle2 size={16} color="var(--success)" />
              )}
              <span style={{ fontWeight: step === "UPLOADING_BACKEND" ? 700 : 500 }}>
                1. Téléversement & calcul du hash SHA-256 sur le serveur
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {step === "WAITING_BLOCKCHAIN" ? (
                <LoadingSpinner size="sm" color="primary" />
              ) : (
                <span style={{ width: 16, height: 16, display: "inline-block" }} />
              )}
              <span style={{ fontWeight: step === "WAITING_BLOCKCHAIN" ? 700 : 500 }}>
                2. Enregistrement immuable sur le Smart Contract (MetaMask)
              </span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isProcessing}
            disabled={!file || isProcessing}
          >
            Confirmer l'ajout du document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
