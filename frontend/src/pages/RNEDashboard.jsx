import React from "react";
import { ROLES } from "../blockchain/contractConfig";
import { OrganizationReviewDashboard } from "../components/dashboard/OrganizationReviewDashboard";
import { Alert } from "../components/common/Alert";
import { FileText, Info } from "lucide-react";

export function RNEDashboard() {
  const checklist = [
    "Vérification de la disponibilité et conformité de la dénomination commerciale",
    "Inscription et attribution de l'identifiant unique au Registre National des Entreprises",
    "Enregistrement des statuts de l'établissement",
  ];

  const note = (
    <div className="alert alert-info">
      <Info size={20} style={{ flexShrink: 0 }} />
      <div>
        <strong>Démarche complémentaire facultative :</strong> L'inscription au RNE est
        sollicitée par l'entrepreneur à titre complémentaire après la validation fiscale. Elle ne
        conditionne pas la validité de la certification principale.
      </div>
    </div>
  );

  return (
    <OrganizationReviewDashboard
      role={ROLES.RNE}
      title="Espace Registre National des Entreprises (RNE)"
      subtitle="Instruction des démarches complémentaires d'immatriculation d'entreprise"
      icon={FileText}
      checklistItems={checklist}
      roleSpecificNote={note}
    />
  );
}
