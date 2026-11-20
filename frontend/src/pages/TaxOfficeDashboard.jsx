import React from "react";
import { ROLES } from "../blockchain/contractConfig";
import { OrganizationReviewDashboard } from "../components/dashboard/OrganizationReviewDashboard";
import { Alert } from "../components/common/Alert";
import { FileSpreadsheet, Info } from "lucide-react";

export function TaxOfficeDashboard() {
  const checklist = [
    "Vérification des approbations préalables : Municipalité et Protection civile conformes",
    "Situation fiscale régulière du promoteur du café",
    "Enregistrement fiscal de l'établissement et déclaration d'existence",
    "Délivrance de l'attestation de conformité fiscale",
  ];

  const note = (
    <div className="alert alert-info">
      <Info size={20} style={{ flexShrink: 0 }} />
      <div>
        <strong>Règle séquentielle du Smart Contract :</strong> La validation fiscale
        intervient impérativement après l'approbation conjointe de la Municipalité et de
        la Protection civile. Votre décision favorable prononce la <strong>finalisation
        officielle de la certification principale</strong>.
      </div>
    </div>
  );

  return (
    <OrganizationReviewDashboard
      role={ROLES.TAX_OFFICE}
      title="Espace Recette des Finances"
      subtitle="Contrôle de conformité fiscale et clôture de la certification principale"
      icon={FileSpreadsheet}
      checklistItems={checklist}
      roleSpecificNote={note}
    />
  );
}
