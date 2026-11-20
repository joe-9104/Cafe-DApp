import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../hooks/useWallet";
import {
  getAllApplications,
  assignRole,
  revokeRole,
  getRoleOf,
  getRepresentativeOf,
} from "../services/applicationService";
import { parseBlockchainError, formatAddress, formatTimestamp } from "../blockchain/blockchainUtils";
import { ROLES, MAIN_STATUS } from "../blockchain/contractConfig";
import { getRoleInfo, getRoleName } from "../utils/roleUtils";
import { MainStatusBadge, ValidationBadge, RoleBadge } from "../components/common/Badge";
import { StatCard } from "../components/dashboard/StatCard";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Alert } from "../components/common/Alert";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Link } from "react-router-dom";
import {
  Shield,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Filter,
  Eye,
  ArrowRight,
  Info,
} from "lucide-react";

export function AdminDashboard() {
  const { account, refreshRole } = useWallet();

  const [applications, setApplications] = useState([]);
  const [representatives, setRepresentatives] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filtre statut pour les dossiers
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Gestion des rôles form
  const [assignForm, setAssignForm] = useState({
    address: "",
    role: ROLES.ENTREPRENEUR,
  });
  const [isAssigning, setIsAssigning] = useState(false);

  // Recherche rôle d'une adresse
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Révocation de rôle
  const [revokingRole, setRevokingRole] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Chargement des données globales
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apps, reps] = await Promise.all([
        getAllApplications(),
        loadAllRepresentatives(),
      ]);
      setApplications(apps);
      setRepresentatives(reps);
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllRepresentatives = async () => {
    const rolesToQuery = [
      ROLES.ADMIN,
      ROLES.ENTREPRENEUR,
      ROLES.MUNICIPALITY,
      ROLES.CIVIL_PROTECTION,
      ROLES.TAX_OFFICE,
      ROLES.RNE,
      ROLES.CNSS,
    ];

    const repMap = {};
    for (const r of rolesToQuery) {
      try {
        const addr = await getRepresentativeOf(r);
        repMap[r] = addr;
      } catch (e) {
        repMap[r] = "0x0000000000000000000000000000000000000000";
      }
    }
    return repMap;
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistiques
  const stats = {
    total: applications.length,
    inProgress: applications.filter(
      (a) => a.mainStatus === MAIN_STATUS.AWAITING_INITIAL_VALIDATIONS
    ).length,
    awaitingTax: applications.filter(
      (a) => a.mainStatus === MAIN_STATUS.AWAITING_TAX_OFFICE
    ).length,
    correction: applications.filter(
      (a) => a.mainStatus === MAIN_STATUS.CORRECTION_REQUIRED
    ).length,
    completed: applications.filter(
      (a) => a.mainStatus === MAIN_STATUS.COMPLETED
    ).length,
  };

  // Filtrage des dossiers
  const filteredApps = applications.filter((app) => {
    // Filtre statut
    if (statusFilter === "IN_PROGRESS" && app.mainStatus !== MAIN_STATUS.AWAITING_INITIAL_VALIDATIONS) return false;
    if (statusFilter === "AWAITING_TAX" && app.mainStatus !== MAIN_STATUS.AWAITING_TAX_OFFICE) return false;
    if (statusFilter === "CORRECTION" && app.mainStatus !== MAIN_STATUS.CORRECTION_REQUIRED) return false;
    if (statusFilter === "COMPLETED" && app.mainStatus !== MAIN_STATUS.COMPLETED) return false;

    // Filtre recherche textuelle
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = app.cafeName.toLowerCase().includes(q);
      const matchAddress = app.establishmentAddress.toLowerCase().includes(q);
      const matchOwner = app.owner.toLowerCase().includes(q);
      const matchId = String(app.id).includes(q);
      return matchName || matchAddress || matchOwner || matchId;
    }

    return true;
  });

  // Assignation d'un rôle
  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!assignForm.address.trim()) {
      setError("Veuillez saisir une adresse Ethereum valide.");
      return;
    }

    const roleNum = Number(assignForm.role);
    if (roleNum === ROLES.NONE || roleNum === ROLES.ADMIN) {
      setError("Impossible d'assigner le rôle Admin ou None via cette interface.");
      return;
    }

    setIsAssigning(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await assignRole(assignForm.address.trim(), roleNum);
      setSuccessMsg(
        `Rôle « ${getRoleName(roleNum)} » assigné avec succès à l'adresse ${assignForm.address} !`
      );
      setAssignForm({ address: "", role: ROLES.ENTREPRENEUR });
      await loadData();
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setIsAssigning(false);
    }
  };

  // Révocation d'un rôle
  const handleRevokeRole = async (roleToRevoke) => {
    if (!window.confirm(`Confirmez-vous la révocation du rôle « ${getRoleName(roleToRevoke)} » ?`)) {
      return;
    }

    setIsRevoking(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await revokeRole(roleToRevoke);
      setSuccessMsg(`Rôle « ${getRoleName(roleToRevoke)} » révoqué avec succès !`);
      await loadData();
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setIsRevoking(false);
    }
  };

  // Recherche rôle pour une adresse
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupAddress.trim()) return;

    setIsLookingUp(true);
    setError(null);
    try {
      const roleFound = await getRoleOf(lookupAddress.trim());
      setLookupResult({
        address: lookupAddress.trim(),
        role: roleFound,
        info: getRoleInfo(roleFound),
      });
    } catch (err) {
      setError(parseBlockchainError(err));
      setLookupResult(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  const assignableRoles = [
    { id: ROLES.ENTREPRENEUR, name: "Entrepreneur (Promoteur du café)" },
    { id: ROLES.MUNICIPALITY, name: "Municipalité" },
    { id: ROLES.CIVIL_PROTECTION, name: "Protection Civile" },
    { id: ROLES.TAX_OFFICE, name: "Recette des Finances" },
    { id: ROLES.RNE, name: "Registre National des Entreprises (RNE)" },
    { id: ROLES.CNSS, name: "Sécurité Sociale (CNSS)" },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={26} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "var(--secondary)",
              }}
            >
              Supervision Administrateur
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Vue d'ensemble de tous les dossiers et gestion des représentants officiels
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          icon={RefreshCw}
          onClick={loadData}
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

      {/* Statistiques globales */}
      <div className="stats-grid">
        <StatCard
          title="Total dossiers"
          value={stats.total}
          icon={FileText}
          color="#4f46e5"
          bg="#f5f3ff"
        />
        <StatCard
          title="Validations initiales"
          value={stats.inProgress}
          icon={Clock}
          color="#f59e0b"
          bg="#fffbeb"
        />
        <StatCard
          title="En attente Fisc"
          value={stats.awaitingTax}
          icon={Clock}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatCard
          title="Correction requise"
          value={stats.correction}
          icon={AlertCircle}
          color="#ef4444"
          bg="#fef2f2"
        />
        <StatCard
          title="Terminés"
          value={stats.completed}
          icon={CheckCircle2}
          color="#10b981"
          bg="#ecfdf5"
        />
      </div>

      {/* SECTION 1 : SUPERVISION DES DOSSIERS */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <FileText size={20} color="var(--primary)" />
              Dossiers administratifs enregistrés sur Ganache
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Consultation complète des demandes de certification de café
            </p>
          </div>
        </div>

        {/* Barre de filtres et recherche */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          {/* Boutons filtres */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "Tous" },
              { id: "IN_PROGRESS", label: "En cours" },
              { id: "AWAITING_TAX", label: "Attente fiscale" },
              { id: "CORRECTION", label: "Correction requise" },
              { id: "COMPLETED", label: "Terminés" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn btn-sm ${
                  statusFilter === f.id ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher (nom, adresse, id)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "2.25rem", fontSize: "0.85rem" }}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
          </div>
        </div>

        {/* Tableau des dossiers */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <LoadingSpinner size="md" text="Chargement des dossiers..." />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="empty-state" style={{ padding: "2rem" }}>
            <p>Aucun dossier ne correspond aux critères de filtre sélectionnés.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom du Café</th>
                  <th>Demandeur</th>
                  <th>Adresse & Surface</th>
                  <th>Date</th>
                  <th>Statut Global</th>
                  <th>Validations</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>#{app.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.cafeName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {app.employeeCount} salarié(s)
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: "0.8rem" }}>
                        {formatAddress(app.owner, 4)}
                      </code>
                    </td>
                    <td>
                      <div>{app.establishmentAddress}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {app.coveredArea} m²
                      </div>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {formatTimestamp(app.createdAt)}
                    </td>
                    <td>
                      <MainStatusBadge status={app.mainStatus} />
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.2rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div>Muni: <ValidationBadge status={app.municipality.status} /></div>
                        <div>Prot Civ: <ValidationBadge status={app.civilProtection.status} /></div>
                        <div>Fisc: <ValidationBadge status={app.taxOffice.status} /></div>
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/applications/${app.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.785rem" }}
                      >
                        <Eye size={13} style={{ marginRight: "4px" }} />
                        Consulter
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2 : GESTION DES RÔLES */}
      <div id="roles" className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Users size={20} color="var(--primary)" />
              Gestion des Rôles et Représentants Organismes
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Attribution, révocation et consultation des représentants sur le Smart Contract
            </p>
          </div>
        </div>

        <div className="alert alert-info" style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Règle du contrat :</strong> Le Smart Contract autorise un seul représentant
            par rôle organisationnel. L'assignation d'une nouvelle adresse pour un rôle remplace
            automatiquement le représentant précédent.
          </div>
        </div>

        {/* Grille Formulaire Assignation & Recherche */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Formulaire d'assignation */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "var(--secondary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <UserCheck size={18} color="var(--primary)" />
              Attribuer un rôle à une adresse
            </h3>

            <form onSubmit={handleAssignRole}>
              <div className="form-group">
                <label className="form-label">Adresse Ethereum (0x...) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="0x..."
                  value={assignForm.address}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rôle à attribuer *</label>
                <select
                  className="form-select"
                  value={assignForm.role}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, role: Number(e.target.value) })
                  }
                >
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isAssigning}
                icon={UserCheck}
                style={{ width: "100%", marginTop: "0.5rem" }}
              >
                Confirmer l'assignation sur Ganache
              </Button>
            </form>
          </div>

          {/* Consultation rôle d'une adresse */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "var(--secondary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Search size={18} color="var(--primary)" />
              Consulter le rôle d'une adresse
            </h3>

            <form onSubmit={handleLookup} style={{ marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Adresse Ethereum</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0x..."
                    value={lookupAddress}
                    onChange={(e) => setLookupAddress(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    loading={isLookingUp}
                    icon={Search}
                  >
                    Vérifier
                  </Button>
                </div>
              </div>
            </form>

            {lookupResult && (
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.85rem",
                  fontSize: "0.875rem",
                }}
              >
                <div style={{ color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                  Résultat pour <code style={{ wordBreak: "break-all" }}>{lookupResult.address}</code> :
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <RoleBadge role={lookupResult.role} />
                  <span style={{ fontWeight: 600 }}>{lookupResult.info.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tableau récapitulatif des représentants actuels */}
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "var(--secondary)",
          }}
        >
          Représentants officiels actuels des 7 rôles
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rôle</th>
                <th>Adresse du représentant actif</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ROLES.ADMIN,
                ROLES.ENTREPRENEUR,
                ROLES.MUNICIPALITY,
                ROLES.CIVIL_PROTECTION,
                ROLES.TAX_OFFICE,
                ROLES.RNE,
                ROLES.CNSS,
              ].map((roleId) => {
                const info = getRoleInfo(roleId);
                const currentRep = representatives[roleId];
                const hasRep =
                  currentRep &&
                  currentRep !== "0x0000000000000000000000000000000000000000";

                return (
                  <tr key={roleId}>
                    <td>
                      <span className={`badge ${info.badgeClass}`}>
                        {info.name}
                      </span>
                    </td>
                    <td>
                      {hasRep ? (
                        <code
                          style={{
                            fontSize: "0.85rem",
                            backgroundColor: "#f1f5f9",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "4px",
                          }}
                        >
                          {currentRep}
                        </code>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
                      {info.description}
                    </td>
                    <td>
                      {roleId !== ROLES.ADMIN && hasRep && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={UserX}
                          loading={isRevoking}
                          onClick={() => handleRevokeRole(roleId)}
                        >
                          Révoquer
                        </Button>
                      )}
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
