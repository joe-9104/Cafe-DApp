import CafeCertificationABI from "./CafeCertification.json";

// Adresse du contrat final déployé sur Ganache
export const CONTRACT_ADDRESS =
  import.meta.env?.VITE_CONTRACT_ADDRESS ||
  "0x73e6B834F332DA2D99506368d874F072F3c52a7b";

// ID du réseau attendu (Ganache utilise 1337 par défaut ou 5777)
export const EXPECTED_CHAIN_ID = import.meta.env?.VITE_CHAIN_ID || "1337";
export const EXPECTED_CHAIN_ID_HEX =
  "0x" + Number(EXPECTED_CHAIN_ID).toString(16);

// RPC URL Ganache
export const GANACHE_RPC_URL =
  import.meta.env?.VITE_GANACHE_RPC_URL || "http://127.0.0.1:7545";

// ABI du Smart Contract
export const CONTRACT_ABI = CafeCertificationABI;

// Configuration des rôles Solidity
export const ROLES = {
  NONE: 0,
  ADMIN: 1,
  ENTREPRENEUR: 2,
  MUNICIPALITY: 3,
  CIVIL_PROTECTION: 4,
  TAX_OFFICE: 5,
  RNE: 6,
  CNSS: 7,
};

// Statuts des validations individuelles
export const VALIDATION_STATUS = {
  NOT_REQUESTED: 0,
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
};

// Statuts principaux d'un dossier
export const MAIN_STATUS = {
  AWAITING_INITIAL_VALIDATIONS: 0,
  AWAITING_TAX_OFFICE: 1,
  CORRECTION_REQUIRED: 2,
  COMPLETED: 3,
};
