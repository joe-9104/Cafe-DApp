import CafeCertificationABI from "./CafeCertification.json";

// Adresse du contrat final déployé sur Ganache
export const CONTRACT_ADDRESS = "0xCONTRACT_ADDRESS"; //Ne pas oublier de la modifier!!

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