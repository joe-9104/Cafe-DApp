import React from "react";
import { ROLES } from "../blockchain/contractConfig";
import { OrganizationReviewDashboard } from "../components/dashboard/OrganizationReviewDashboard";
import { Building2 } from "lucide-react";

export function MunicipalityDashboard() {
  const checklist = [
    "Vérification de l'emplacement et de l'implantation dans le périmètre communal",
    "Conformité avec le plan d'aménagement urbain et l'affectation commerciale",
    "Adéquation de la surface couverte avec l'activité de café de 1ère catégorie",
    "Vérification des accès voirie et de la salubrité publique locale",
  ];

  return (
    <OrganizationReviewDashboard
      role={ROLES.MUNICIPALITY}
      title="Espace Municipalité"
      subtitle="Instruction des demandes relatives à la conformité locale et à l'urbanisme"
      icon={Building2}
      checklistItems={checklist}
    />
  );
}
