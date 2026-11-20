import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { formatAddress } from "../../blockchain/blockchainUtils";
import { RoleBadge } from "../common/Badge";
import { Button } from "../common/Button";
import {
  Coffee,
  Wallet,
  LogOut,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export function Navbar() {
  const {
    account,
    role,
    isCorrectNetwork,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-badge">
          <Coffee size={20} />
        </div>
        <div>
          <span>CafeCertification</span>
          <span
            style={{
              fontSize: "0.725rem",
              display: "block",
              color: "var(--text-muted)",
              fontWeight: 400,
            }}
          >
            Simulation Administrative • Tunisie
          </span>
        </div>
      </Link>

      <div className="navbar-right">
        {/* Statut Réseau Ganache */}
        {isConnected && (
          <div>
            {isCorrectNetwork ? (
              <span className="badge badge-emerald">
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
                Ganache (1337)
              </span>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={switchNetwork}
                icon={AlertTriangle}
              >
                Réseau incorrect ({chainId}) - Basculer
              </Button>
            )}
          </div>
        )}

        {/* Détails du compte et rôle */}
        {isConnected ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-color)",
              }}
            >
              <RoleBadge role={role} />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                }}
              >
                {formatAddress(account, 4)}
              </span>
              <button
                onClick={handleCopy}
                title="Copier l'adresse"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: copied ? "var(--success)" : "var(--text-muted)",
                  padding: "2px",
                  display: "flex",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              icon={LogOut}
              title="Déconnexion"
            >
              Déconnexion
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={connect}
            loading={isConnecting}
            icon={Wallet}
          >
            Connecter MetaMask
          </Button>
        )}
      </div>
    </header>
  );
}
