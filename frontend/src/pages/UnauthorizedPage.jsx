import React from "react";
import { useWallet } from "../hooks/useWallet";
import { formatAddress } from "../blockchain/blockchainUtils";
import { Button } from "../components/common/Button";
import { ShieldAlert, RefreshCw, LogOut } from "lucide-react";

export function UnauthorizedPage() {
  const { account, refreshRole, disconnect, adminAddress } = useWallet();

  return (
    <div style={{ maxWidth: "650px", margin: "2rem auto" }}>
      <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--secondary)",
            marginBottom: "0.5rem",
          }}
        >
          Accès Non Autorisé
        </h2>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
            lineHeight: 1.5,
          }}
        >
          L'adresse Ethereum actuellement connectée ne dispose d'aucun rôle
          organisationnel ou entrepreneur dans le Smart Contract CafeCertification.
        </p>

        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            textAlign: "left",
          }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Adresse connectée :</strong>{" "}
            <code style={{ wordBreak: "break-all" }}>{account || "Non connectée"}</code>
          </div>
          <div>
            <strong>Administrateur du contrat :</strong>{" "}
            <code style={{ wordBreak: "break-all" }}>
              {adminAddress || "0x0Be6070edC2BCeDC94fBe7Ee95ee036588e3Ad03"}
            </code>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
          }}
        >
          Pour continuer, demandez à l'administrateur d'assigner un rôle à cette adresse
          via la fonction <code>assignRole</code>, ou basculez vers l'un des comptes de
          démonstration dans MetaMask.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Button variant="primary" icon={RefreshCw} onClick={refreshRole}>
            Vérifier à nouveau le rôle
          </Button>
          <Button variant="outline" icon={LogOut} onClick={disconnect}>
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
