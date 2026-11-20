import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "../hooks/useWallet";
import {
  getMyApplications,
  createApplication,
  resubmitRejectedValidation,
  requestSupplementaryValidation,
} from "../services/applicationService";
import { parseBlockchainError } from "../blockchain/blockchainUtils";
import { MAIN_STATUS, ROLES, VALIDATION_STATUS } from "../blockchain/contractConfig";
import { StatCard } from "../components/dashboard/StatCard";
import { ApplicationCard } from "../components/applications/ApplicationCard";
import { ApplicationTimeline } from "../components/applications/ApplicationTimeline";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Alert } from "../components/common/Alert";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import {
  Coffee,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Trash2,
  Send,
  Info,
} from "lucide-react";

export function EntrepreneurDashboard() {
  const { account } = useWallet();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal Création
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cafeName: "",
    establishmentAddress: "",
    coveredArea: "",
    employeeCount: "0",
  });
  // Employés locaux
  const [employees, setEmployees] = useState([]);

  // Modal Resoumission / Note de correction
  const [resubmitModalData, setResubmitModalData] = useState(null); // { appId, orgRole, orgName }
  const [correctionNote, setCorrectionNote] = useState("");
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Dossier sélectionné pour inspection timeline
  const [selectedAppId, setSelectedAppId] = useState(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyApplications();
      setApplications(data);
      if (data.length > 0 && !selectedAppId) {
        setSelectedAppId(data[0].id);
      }
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedAppId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Statistiques
  const stats = {
    total: applications.length,
    inProgress: applications.filter(
      (a) =>
        a.mainStatus === MAIN_STATUS.AWAITING_INITIAL_VALIDATIONS ||
        a.mainStatus === MAIN_STATUS.AWAITING_TAX_OFFICE
    ).length,
    completed: applications.filter((a) => a.mainStatus === MAIN_STATUS.COMPLETED).length,
    correctionRequired: applications.filter(
      (a) => a.mainStatus === MAIN_STATUS.CORRECTION_REQUIRED
    ).length,
  };

  // Gestion des employés dans le formulaire
  const handleAddEmployee = () => {
    setEmployees([...employees, { firstName: "", lastName: "", cnssNumber: "" }]);
    setFormData((prev) => ({
      ...prev,
      employeeCount: String(employees.length + 1),
    }));
  };

  const handleRemoveEmployee = (index) => {
    const updated = employees.filter((_, i) => i !== index);
    setEmployees(updated);
    setFormData((prev) => ({
      ...prev,
      employeeCount: String(updated.length),
    }));
  };

  const handleEmployeeChange = (index, field, value) => {
    const updated = [...employees];
    updated[index][field] = value;
    setEmployees(updated);
  };

  // Soumission création dossier
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const { cafeName, establishmentAddress, coveredArea, employeeCount } = formData;

    if (!cafeName.trim()) {
      setError("Le nom du café est obligatoire.");
      return;
    }
    if (!establishmentAddress.trim()) {
      setError("L'adresse de l'établissement est obligatoire.");
      return;
    }
    const areaNum = Number(coveredArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setError("La surface couverte doit être un nombre strictement positif (> 0 m²).");
      return;
    }
    const empNum = Number(employeeCount);
    if (isNaN(empNum) || empNum < 0) {
      setError("Le nombre d'employés doit être supérieur ou égal à 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { receipt } = await createApplication({
        cafeName,
        establishmentAddress,
        coveredArea: areaNum,
        employeeCount: empNum,
      });

      setSuccessMsg(
        `Dossier créé avec succès sur la blockchain ! (Tx: ${receipt.hash.substring(0, 10)}...)`
      );
      setIsCreateModalOpen(false);
      setFormData({
        cafeName: "",
        establishmentAddress: "",
        coveredArea: "",
        employeeCount: "0",
      });
      setEmployees([]);
      await loadApplications();
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission note de correction
  const handleResubmitSubmit = async (e) => {
    e.preventDefault();
    if (!correctionNote.trim()) {
      setError("Une note explicative des corrections apportées est obligatoire.");
      return;
    }

    setIsResubmitting(true);
    setError(null);
    try {
      await resubmitRejectedValidation(
        resubmitModalData.appId,
        resubmitModalData.orgRole,
        correctionNote
      );

      setSuccessMsg(
        `Note de correction transmise avec succès à l'organisme ! Le dossier est de nouveau en attente d'instruction.`
      );
      setResubmitModalData(null);
      setCorrectionNote("");
      await loadApplications();
    } catch (err) {
      setError(parseBlockchainError(err));
    } finally {
      setIsResubmitting(false);
    }
  };

  // Demande de démarche complémentaire (RNE ou CNSS)
  const handleRequestSupplementary = async (orgRole) => {
    if (!selectedAppId) return;
    setError(null);
    try {
      await requestSupplementaryValidation(selectedAppId, orgRole);
      setSuccessMsg(
        `Démarche complémentaire demandée avec succès ! L'organisme concerné a été notifié.`
      );
      await loadApplications();
    } catch (err) {
      setError(parseBlockchainError(err));
    }
  };

  const selectedApplication = applications.find((a) => a.id === selectedAppId);

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
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--secondary)",
            }}
          >
            Espace Entrepreneur
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Créez et suivez vos dossiers de certification pour l'ouverture d'un café.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={loadApplications}
            loading={loading}
          >
            Actualiser
          </Button>
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nouveau dossier
          </Button>
        </div>
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

      {/* Cartes métriques */}
      <div className="stats-grid">
        <StatCard
          title="Dossiers créés"
          value={stats.total}
          icon={FileText}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatCard
          title="En cours d'instruction"
          value={stats.inProgress}
          icon={Clock}
          color="#f59e0b"
          bg="#fffbeb"
        />
        <StatCard
          title="Certifications terminées"
          value={stats.completed}
          icon={CheckCircle2}
          color="#10b981"
          bg="#ecfdf5"
        />
        <StatCard
          title="Corrections requises"
          value={stats.correctionRequired}
          icon={AlertCircle}
          color="#ef4444"
          bg="#fef2f2"
        />
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <LoadingSpinner size="lg" text="Chargement des dossiers depuis la blockchain..." />
        </div>
      ) : applications.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Coffee size={28} />
          </div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Aucun dossier de café créé
          </h3>
          <p style={{ maxWidth: "450px", margin: "0 auto 1.5rem", fontSize: "0.9rem" }}>
            Vous n'avez pas encore soumis de demande de certification. Cliquez sur le bouton
            ci-dessous pour déposer votre premier dossier.
          </p>
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Créer un dossier
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* Liste des dossiers */}
          <div>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "var(--secondary)",
              }}
            >
              Mes Demandes ({applications.length})
            </h2>

            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                style={{
                  cursor: "pointer",
                  borderRadius: "var(--radius-md)",
                  border:
                    selectedAppId === app.id
                      ? "2px solid var(--primary)"
                      : "1px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <ApplicationCard application={app} />
              </div>
            ))}
          </div>

          {/* Timeline et progression du dossier sélectionné */}
          <div>
            {selectedApplication ? (
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      Progression • Dossier #{selectedApplication.id} ({selectedApplication.cafeName})
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Suivi des étapes d'instruction auprès des organismes
                    </p>
                  </div>
                </div>

                <ApplicationTimeline
                  application={selectedApplication}
                  isOwner={true}
                  onOpenResubmit={(orgRole, orgName) =>
                    setResubmitModalData({
                      appId: selectedApplication.id,
                      orgRole,
                      orgName,
                    })
                  }
                  onRequestSupplementary={handleRequestSupplementary}
                />
              </div>
            ) : (
              <div className="card empty-state">
                <p>Sélectionnez un dossier pour afficher sa progression.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Création de Dossier */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Création d'un dossier de certification de café"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Nom du Café *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Café El Medina"
              value={formData.cafeName}
              onChange={(e) =>
                setFormData({ ...formData, cafeName: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse de l'établissement *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: 12 Avenue Habib Bourguiba, Tunis"
              value={formData.establishmentAddress}
              onChange={(e) =>
                setFormData({ ...formData, establishmentAddress: e.target.value })
              }
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label className="form-label">Surface couverte (m²) *</label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-input"
                placeholder="Ex: 150"
                value={formData.coveredArea}
                onChange={(e) =>
                  setFormData({ ...formData, coveredArea: e.target.value })
                }
                required
              />
              <span className="form-help">Doit être strictement supérieure à 0.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre d'employés *</label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={formData.employeeCount}
                onChange={(e) =>
                  setFormData({ ...formData, employeeCount: e.target.value })
                }
                required
              />
              <span className="form-help">
                Conditionne l'éligibilité à la validation CNSS (&gt; 0).
              </span>
            </div>
          </div>

          {/* Section dynamique des employés (stockage local explicite) */}
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px dashed var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <label className="form-label" style={{ marginBottom: 0 }}>
                Informations détaillées du personnel (facultatif)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={UserPlus}
                onClick={handleAddEmployee}
              >
                Ajouter un employé
              </Button>
            </div>

            <div className="alert alert-info" style={{ fontSize: "0.8rem", padding: "0.6rem 0.8rem" }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>Note importante de transparence :</strong> Le Smart Contract ne
                stocke que le <strong>nombre total d'employés</strong> ({formData.employeeCount}).
                Les informations individuelles saisies ici restent uniquement dans la mémoire locale
                du navigateur et ne sont pas écrites sur la blockchain.
              </div>
            </div>

            {employees.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
                {employees.map((emp, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr auto",
                      gap: "0.5rem",
                      alignItems: "center",
                      backgroundColor: "#f8fafc",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Prénom"
                      value={emp.firstName}
                      onChange={(e) =>
                        handleEmployeeChange(index, "firstName", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nom"
                      value={emp.lastName}
                      onChange={(e) =>
                        handleEmployeeChange(index, "lastName", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="N° CNSS"
                      value={emp.cnssNumber}
                      onChange={(e) =>
                        handleEmployeeChange(index, "cnssNumber", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployee(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--danger)",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      title="Supprimer cet employé"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.75rem",
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              icon={Send}
            >
              Créer le dossier sur la blockchain
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Resoumission d'une validation rejetée */}
      <Modal
        isOpen={Boolean(resubmitModalData)}
        onClose={() => !isResubmitting && setResubmitModalData(null)}
        title={`Resoumission suite à rejet • ${resubmitModalData?.orgName || ""}`}
        maxWidth="550px"
      >
        <form onSubmit={handleResubmitSubmit}>
          <div className="alert alert-info" style={{ fontSize: "0.85rem" }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Processus de correction :</strong> Conformément aux règles du
              Smart Contract, les informations initiales du café ne sont pas modifiables.
              Vous transmettez une <strong>note d'explication des corrections</strong> qui
              permettra à l'organisme de réexaminer la validation.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Explication des corrections et justificatifs apportés *
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Ex: Les extincteurs réglementaires et le plan d'évacuation ont été installés selon les prescriptions requises..."
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              required
            />
            <span className="form-help">
              Ce texte sera enregistré dans le Smart Contract et transmis à l'organisme.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.5rem",
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => setResubmitModalData(null)}
              disabled={isResubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={isResubmitting}
              icon={Send}
            >
              Transmettre la correction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
