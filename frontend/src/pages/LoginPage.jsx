import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { Button } from "../components/common/Button";
import { Alert } from "../components/common/Alert";
import { ROLES, CONTRACT_ADDRESS } from "../blockchain/contractConfig";
import { getRoleInfo, getRoleDashboardPath } from "../utils/roleUtils";
import { formatAddress } from "../blockchain/blockchainUtils";
import {
  Coffee,
  Wallet,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export function LoginPage() {
  const {
    account,
    role,
    isConnected,
    isCorrectNetwork,
    isConnecting,
    error,
    connect,
  } = useWallet();

  const navigate = useNavigate();
  const [connectError, setConnectError] = useState(null);

  // Redirection automatique dès que le wallet est connecté avec un rôle identifié
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      const destination = getRoleDashboardPath(role);
      navigate(destination, { replace: true });
    }
  }, [isConnected, isCorrectNetwork, role, navigate]);

  const handleConnect = async () => {
    setConnectError(null);
    try {
      const result = await connect();
      if (result && result.isCorrectNetwork) {
        navigate(getRoleDashboardPath(result.role), { replace: true });
      }
    } catch (err) {
      setConnectError(err.message);
    }
  };

  // Liste des comptes configurés lors du déploiement Ganache
  const demoAccounts = [
    { role: ROLES.ADMIN, name: "Administrateur", addr: "0x0Be6070edC2BCeDC94fBe7Ee95ee036588e3Ad03" },
    { role: ROLES.ENTREPRENEUR, name: "Entrepreneur", addr: "0x2b2b54BE0491E411aD194b871fd7fcDFaCd765CB" },
    { role: ROLES.MUNICIPALITY, name: "Municipalité", addr: "0xeCAe9aDC83C3ae804c265b34E81a13B7f4Df00a0" },
    { role: ROLES.CIVIL_PROTECTION, name: "Protection Civile", addr: "0xC9b580e802571910317C2d12c6906ea279B22741" },
    { role: ROLES.TAX_OFFICE, name: "Recette des Finances", addr: "0x5CC0b54F0D16e0A548F28F1fAB7B33593249Ec1b" },
    { role: ROLES.RNE, name: "RNE", addr: "0x1661Db8DDfF6F1E56f1CC044b11f56FF33d5f4BB" },
    { role: ROLES.CNSS, name: "CNSS", addr: "0xff1D3A26eBB268d962A80C608C90370170631837" },
  ];

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "2rem auto",
        padding: "0 1rem",
      }}
    >
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: "3rem 2rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Coffee size={36} />
        </div>

        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--secondary)",
            marginBottom: "0.5rem",
          }}
        >
          Certification Administrative de Café
        </h1>
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--text-muted)",
            maxWidth: "600px",
            margin: "0 auto 2rem",
            lineHeight: 1.6,
          }}
        >
          Plateforme décentralisée simulant la procédure administrative d'ouverture
          d'un café de première catégorie en Tunisie, connectée au Smart Contract
          sur la blockchain Ganache.
        </p>

        {(connectError || error) && (
          <div style={{ maxWidth: "550px", margin: "0 auto 1.5rem" }}>
            <Alert
              type="danger"
              message={connectError || error}
              onClose={() => setConnectError(null)}
            />
          </div>
        )}

        <div style={{ display: "inline-block" }}>
          <Button
            variant="primary"
            size="lg"
            icon={Wallet}
            onClick={handleConnect}
            loading={isConnecting}
            style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}
          >
            Connecter avec MetaMask
          </Button>
        </div>

        <div
          style={{
            marginTop: "1.25rem",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
          }}
        >
          Le rôle est déterminé automatiquement par le Smart Contract selon votre compte actif.
        </div>
      </div>

      {/* Guide des comptes de démonstration Ganache */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <HelpCircle size={20} color="var(--primary)" />
            Guide des comptes de démonstration Ganache
          </h3>
          <span
            style={{
              fontSize: "0.8rem",
              fontFamily: "monospace",
              color: "var(--text-muted)",
            }}
          >
            Contrat : {formatAddress(CONTRACT_ADDRESS, 6)}
          </span>
        </div>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}
        >
          Pour tester les différents rôles du workflow administratif, importez les clés
          privées correspondantes depuis votre instance Ganache dans MetaMask, puis sélectionnez
          le compte souhaité :
        </p>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rôle</th>
                <th>Adresse Ethereum</th>
                <th>Attribution dans le Workflow</th>
              </tr>
            </thead>
            <tbody>
              {demoAccounts.map((acc) => {
                const info = getRoleInfo(acc.role);
                return (
                  <tr key={acc.role}>
                    <td>
                      <span className={`badge ${info.badgeClass}`}>
                        {info.name}
                      </span>
                    </td>
                    <td>
                      <code
                        style={{
                          fontSize: "0.85rem",
                          backgroundColor: "#f1f5f9",
                          padding: "0.2rem 0.4rem",
                          borderRadius: "4px",
                        }}
                      >
                        {acc.addr}
                      </code>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {info.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
