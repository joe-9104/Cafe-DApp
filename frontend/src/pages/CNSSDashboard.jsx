import React from "react";
import { ROLES } from "../blockchain/contractConfig";
import { OrganizationReviewDashboard } from "../components/dashboard/OrganizationReviewDashboard";
import { Alert } from "../components/common/Alert";
import { Users, Info } from "lucide-react";

export function CNSSDashboard() {
  const checklist = [
    "Affiliation de l'établissement à la Caisse Nationale de Sécurité Sociale",
    "Conformité de l'effectif déclaré par rapport au personnel constaté",
    "Régularité des déclarations de salaires et cotisations patronales/salariales",
  ];

  const note = (
    <div className="alert alert-info">
      <Info size={20} style={{ flexShrink: 0 }} />
      <div>
        <strong>Démarche complémentaire personnel salarié :</strong> La validation CNSS est
        sollicitée uniquement si le café emploie du personnel salarié (nombre d'employés &gt; 0).
        Conformément à la politique de confidentialité de la blockchain, aucun détail nominatif
        d'employé n'est stocké dans le Smart Contract.
      </div>
    </div>
  );

  return (
    <OrganizationReviewDashboard
      role={ROLES.CNSS}
      title="Espace Caisse Nationale de Sécurité Sociale (CNSS)"
      subtitle="Instruction des démarches relatives à l'affiliation et au personnel déclaré"
      icon={Users}
      checklistItems={checklist}
      roleSpecificNote={note}
    />
  );
}
