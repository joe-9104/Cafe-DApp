import { VALIDATION_STATUS, MAIN_STATUS } from "../blockchain/contractConfig";

export const VALIDATION_STATUS_INFO = {
  [VALIDATION_STATUS.NOT_REQUESTED]: {
    id: VALIDATION_STATUS.NOT_REQUESTED,
    label: "Non demandée",
    badgeClass: "badge-gray",
    color: "#94a3b8",
    description: "La démarche n'a pas encore été sollicitée ou activée.",
  },
  [VALIDATION_STATUS.PENDING]: {
    id: VALIDATION_STATUS.PENDING,
    label: "En attente",
    badgeClass: "badge-amber",
    color: "#f59e0b",
    description: "Le dossier est en cours d'examen par cet organisme.",
  },
  [VALIDATION_STATUS.APPROVED]: {
    id: VALIDATION_STATUS.APPROVED,
    label: "Approuvée",
    badgeClass: "badge-emerald",
    color: "#10b981",
    description: "L'organisme a validé favorablement cette étape.",
  },
  [VALIDATION_STATUS.REJECTED]: {
    id: VALIDATION_STATUS.REJECTED,
    label: "Rejetée",
    badgeClass: "badge-rose",
    color: "#ef4444",
    description: "L'organisme a émis des réserves ou rejeté cette étape.",
  },
};

export const MAIN_STATUS_INFO = {
  [MAIN_STATUS.AWAITING_INITIAL_VALIDATIONS]: {
    id: MAIN_STATUS.AWAITING_INITIAL_VALIDATIONS,
    label: "En attente validations initiales",
    shortLabel: "Validations initiales",
    badgeClass: "badge-amber",
    color: "#f59e0b",
    description: "En attente de la Municipalité et/ou de la Protection civile (processus parallèle).",
  },
  [MAIN_STATUS.AWAITING_TAX_OFFICE]: {
    id: MAIN_STATUS.AWAITING_TAX_OFFICE,
    label: "En attente Recette des Finances",
    shortLabel: "Étape fiscale",
    badgeClass: "badge-blue",
    color: "#3b82f6",
    description: "Validations locales obtenues. En attente de l'avis de la Recette des Finances.",
  },
  [MAIN_STATUS.CORRECTION_REQUIRED]: {
    id: MAIN_STATUS.CORRECTION_REQUIRED,
    label: "Correction requise",
    shortLabel: "Correction requise",
    badgeClass: "badge-rose",
    color: "#ef4444",
    description: "Au moins un organisme a rejeté son étape. Une resoumission avec note explicative est nécessaire.",
  },
  [MAIN_STATUS.COMPLETED]: {
    id: MAIN_STATUS.COMPLETED,
    label: "Certification principale approuvée",
    shortLabel: "Terminé",
    badgeClass: "badge-emerald",
    color: "#10b981",
    description: "Processus principal validé par le fisc. Démarches RNE/CNSS facultatives désormais possibles.",
  },
};

/**
 * Récupère les infos d'un statut de validation individuelle
 * @param {number|bigint|string} statusId 
 */
export function getValidationStatusInfo(statusId) {
  const num = Number(statusId ?? 0);
  return VALIDATION_STATUS_INFO[num] || VALIDATION_STATUS_INFO[VALIDATION_STATUS.NOT_REQUESTED];
}

/**
 * Récupère les infos du statut global d'un dossier
 * @param {number|bigint|string} statusId 
 */
export function getMainStatusInfo(statusId) {
  const num = Number(statusId ?? 0);
  return MAIN_STATUS_INFO[num] || MAIN_STATUS_INFO[MAIN_STATUS.AWAITING_INITIAL_VALIDATIONS];
}
