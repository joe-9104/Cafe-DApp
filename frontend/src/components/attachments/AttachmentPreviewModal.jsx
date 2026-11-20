import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { getAttachmentPreviewUrl, getAttachmentDownloadUrl } from "../../services/applicationService";
import { Download, ExternalLink, FileText } from "lucide-react";

export function AttachmentPreviewModal({ attachment, isOpen, onClose }) {
  if (!attachment || !isOpen) return null;

  const previewUrl = getAttachmentPreviewUrl(attachment.attachmentId);
  const downloadUrl = getAttachmentDownloadUrl(attachment.attachmentId);
  const isImage = /\.(jpg|jpeg|png)$/i.test(attachment.filename);
  const isPdf = /\.pdf$/i.test(attachment.filename);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Aperçu • ${attachment.filename}`}
      maxWidth="850px"
      footer={
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Download size={16} />
            Télécharger le document
          </a>
        </div>
      }
    >
      <div style={{ textAlign: "center", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isImage ? (
          <img
            src={previewUrl}
            alt={attachment.filename}
            style={{
              maxWidth: "100%",
              maxHeight: "550px",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-md)",
              objectFit: "contain",
            }}
          />
        ) : isPdf ? (
          <iframe
            src={previewUrl}
            title={attachment.filename}
            style={{
              width: "100%",
              height: "550px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-sm)",
            }}
          />
        ) : (
          <div style={{ padding: "3rem", color: "var(--text-muted)" }}>
            <FileText size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
            <p>Aperçu non disponible pour ce type de document.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Vous pouvez télécharger le fichier pour le consulter sur votre appareil.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
