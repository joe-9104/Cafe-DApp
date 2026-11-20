import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, AlertCircle } from "lucide-react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation de l'action",
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !loading && onClose()}
      title={title}
      maxWidth="500px"
      footer={
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", width: "100%" }}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            backgroundColor: variant === "danger" ? "var(--danger-bg)" : "var(--warning-bg)",
            color: variant === "danger" ? "var(--danger)" : "var(--warning)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {variant === "danger" ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
        </div>
        <div>
          <div style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.5 }}>
            {message}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Cette action sera transmise au Smart Contract et scellée sur la blockchain.
          </div>
        </div>
      </div>
    </Modal>
  );
}
