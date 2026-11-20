import React from "react";
import { NavLink } from "react-router-dom";
import { useWallet } from "../../hooks/useWallet";
import { ROLES, CONTRACT_ADDRESS } from "../../blockchain/contractConfig";
import { formatAddress } from "../../blockchain/blockchainUtils";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Users,
  Settings,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

export function Sidebar() {
  const { role, roleInfo, account } = useWallet();

  const getLinksForRole = () => {
    switch (role) {
      case ROLES.ADMIN:
        return [
          { to: "/admin", label: "Supervision globale", icon: LayoutDashboard },
          { to: "/admin#roles", label: "Gestion des rôles", icon: Users },
        ];
      case ROLES.ENTREPRENEUR:
        return [
          { to: "/entrepreneur", label: "Mes dossiers de café", icon: FileText },
        ];
      case ROLES.MUNICIPALITY:
        return [
          { to: "/municipality", label: "Dossiers à instruire", icon: Building2 },
        ];
      case ROLES.CIVIL_PROTECTION:
        return [
          { to: "/civil-protection", label: "Contrôles sécurité", icon: ShieldCheck },
        ];
      case ROLES.TAX_OFFICE:
        return [
          { to: "/tax-office", label: "Validations fiscales", icon: FileSpreadsheet },
        ];
      case ROLES.RNE:
        return [
          { to: "/rne", label: "Immatriculation RNE", icon: FileText },
        ];
      case ROLES.CNSS:
        return [
          { to: "/cnss", label: "Vérifications CNSS", icon: Users },
        ];
      default:
        return [
          { to: "/unauthorized", label: "Accès restreint", icon: ShieldAlert },
        ];
    }
  };

  const navLinks = getLinksForRole();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user-card">
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              marginBottom: "0.25rem",
            }}
          >
            Rôle Actif
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: roleInfo.color || "var(--primary)",
              marginBottom: "0.25rem",
            }}
          >
            {roleInfo.name}
          </div>
          <p
            style={{
              fontSize: "0.775rem",
              color: "var(--text-muted)",
              lineHeight: 1.35,
            }}
          >
            {roleInfo.description}
          </p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div
          style={{
            fontSize: "0.72rem",
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "var(--text-light)",
            padding: "0.5rem 1rem 0.25rem",
          }}
        >
          Navigation Principale
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontWeight: 600, color: "var(--secondary)" }}>
            Smart Contract
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
            title={CONTRACT_ADDRESS}
          >
            {formatAddress(CONTRACT_ADDRESS, 6)}
          </div>
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "var(--text-light)",
            lineHeight: 1.3,
          }}
        >
          Projet académique • Blockchain Ganache
        </div>
      </div>
    </aside>
  );
}
