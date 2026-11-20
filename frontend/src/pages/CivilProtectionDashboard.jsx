import React from "react";
import { ROLES } from "../blockchain/contractConfig";
import { OrganizationReviewDashboard } from "../components/dashboard/OrganizationReviewDashboard";
import { ShieldCheck } from "lucide-react";

export function CivilProtectionDashboard() {
  const checklist = [
    "Contrôle des issues de secours et des dégagements d'évacuation",
    "Présence et vérification périodique des extincteurs normalisés",
    "Conformité des installations électriques et des coupures d'urgence",
    "Respect des capacités d'accueil du public au prorata de la surface",
  ];

  return (
    <OrganizationReviewDashboard
      role={ROLES.CIVIL_PROTECTION}
      title="Espace Protection Civile"
      subtitle="Contrôle de sécurité incendie, prévention des risques et évacuation"
      icon={ShieldCheck}
      checklistItems={checklist}
    />
  );
}
