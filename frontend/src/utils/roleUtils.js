import { ROLES } from "../blockchain/contractConfig";

export const ROLE_INFO = {
  [ROLES.NONE]: {
    id: ROLES.NONE,
    name: "Non assigné",
    shortName: "Visiteur",
    path: "/unauthorized",
    color: "#64748b",
    badgeClass: "badge-gray",
    description: "Aucun rôle administratif n'est associé à cette adresse.",
    isOrganization: false,
  },
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    name: "Administrateur Système",
    shortName: "Admin",
    path: "/admin",
    color: "#4f46e5",
    badgeClass: "badge-purple",
    description: "Supervise l'ensemble des dossiers et gère les représentants des organismes.",
    isOrganization: false,
  },
  [ROLES.ENTREPRENEUR]: {
    id: ROLES.ENTREPRENEUR,
    name: "Entrepreneur",
    shortName: "Entrepreneur",
    path: "/entrepreneur",
    color: "#2563eb",
    badgeClass: "badge-blue",
    description: "Crée les demandes de certification de café et soumet les corrections nécessaires.",
    isOrganization: false,
  },
  [ROLES.MUNICIPALITY]: {
    id: ROLES.MUNICIPALITY,
    name: "Municipalité",
    shortName: "Municipalité",
    path: "/municipality",
    color: "#0d9488",
    badgeClass: "badge-teal",
    description: "Vérifie l'emplacement, l'adresse et la conformité locale de l'établissement.",
    isOrganization: true,
  },
  [ROLES.CIVIL_PROTECTION]: {
    id: ROLES.CIVIL_PROTECTION,
    name: "Protection Civile",
    shortName: "Protection Civile",
    path: "/civil-protection",
    color: "#ea580c",
    badgeClass: "badge-orange",
    description: "Contrôle les conditions de sécurité incendie, de prévention et d'évacuation.",
    isOrganization: true,
  },
  [ROLES.TAX_OFFICE]: {
    id: ROLES.TAX_OFFICE,
    name: "Recette des Finances",
    shortName: "Recette Finances",
    path: "/tax-office",
    color: "#16a34a",
    badgeClass: "badge-green",
    description: "Intervient après validation municipale et sécuritaire pour clôturer la certification principale.",
    isOrganization: true,
  },
  [ROLES.RNE]: {
    id: ROLES.RNE,
    name: "Registre National des Entreprises (RNE)",
    shortName: "RNE",
    path: "/rne",
    color: "#7c3aed",
    badgeClass: "badge-violet",
    description: "Traite la démarche complémentaire facultative d'immatriculation au registre.",
    isOrganization: true,
  },
  [ROLES.CNSS]: {
    id: ROLES.CNSS,
    name: "Sécurité Sociale (CNSS)",
    shortName: "CNSS",
    path: "/cnss",
    color: "#0284c7",
    badgeClass: "badge-sky",
    description: "Traite la démarche complémentaire facultative relative au personnel salarié.",
    isOrganization: true,
  },
};

/**
 * Retourne les détails d'un rôle donné
 * @param {number|string|bigint} roleId 
 */
export function getRoleInfo(roleId) {
  const numericRole = Number(roleId ?? 0);
  return ROLE_INFO[numericRole] || ROLE_INFO[ROLES.NONE];
}

/**
 * Retourne le nom lisible d'un rôle
 * @param {number|string|bigint} roleId 
 */
export function getRoleName(roleId) {
  return getRoleInfo(roleId).name;
}

/**
 * Retourne le chemin du dashboard pour un rôle
 * @param {number|string|bigint} roleId 
 */
export function getRoleDashboardPath(roleId) {
  return getRoleInfo(roleId).path;
}

/**
 * Vérifie si un rôle est un organisme certificateur
 * @param {number|string|bigint} roleId 
 */
export function isOrganizationRole(roleId) {
  return Boolean(getRoleInfo(roleId).isOrganization);
}
