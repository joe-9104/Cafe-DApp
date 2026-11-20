/**
 * Utilitaires pour le formatage et la gestion des données blockchain Ethers.js v6
 */

/**
 * Raccourcit une adresse Ethereum pour un affichage compact (ex: 0x1234...abcd)
 * @param {string} address - L'adresse Ethereum
 * @param {number} chars - Nombre de caractères au début et à la fin
 * @returns {string} Adresse formatée
 */
export function formatAddress(address, chars = 4) {
  if (!address || typeof address !== 'string') return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Convertit un timestamp Unix (secondes) en date lisible en français
 * @param {number|bigint|string} timestamp - Timestamp en secondes
 * @returns {string} Date formatée
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'Non renseigné';
  const tsNum = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
  if (!tsNum || tsNum <= 0) return 'Non renseigné';
  
  const date = new Date(tsNum * 1000);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Convertit de manière sécurisée une valeur BigInt en string ou number
 * @param {any} val - Valeur pouvant être un BigInt
 * @returns {string} Chaîne représentant la valeur
 */
export function safeBigIntToString(val) {
  if (val === null || val === undefined) return '0';
  if (typeof val === 'bigint') return val.toString();
  return String(val);
}

/**
 * Convertit de manière sécurisée une valeur BigInt en Number (si < MAX_SAFE_INTEGER)
 * @param {any} val - Valeur BigInt
 * @returns {number} Nombre entier
 */
export function safeBigIntToNumber(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'bigint') return Number(val);
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Analyse une erreur MetaMask ou Ethers.js v6 pour produire un message compréhensible en français
 * @param {any} error - L'objet erreur capturé
 * @returns {string} Message d'erreur clair en français
 */
export function parseBlockchainError(error) {
  if (!error) return 'Une erreur inconnue est survenue.';

  const message = error.message || '';
  const reason = error.reason || '';
  const errorString = `${message} ${reason}`.toLowerCase();

  // Rejet utilisateur
  if (
    error.code === 4001 ||
    error.code === 'ACTION_REJECTED' ||
    errorString.includes('user rejected') ||
    errorString.includes('rejected the request')
  ) {
    return "La transaction a été refusée par l'utilisateur dans MetaMask.";
  }

  // Solde insuffisant
  if (
    error.code === 'INSUFFICIENT_FUNDS' ||
    errorString.includes('insufficient funds') ||
    errorString.includes('exceeds balance')
  ) {
    return 'Fonds insuffisants sur votre compte Ganache pour payer les frais de gas.';
  }

  // Réseau non supporté ou problème RPC
  if (
    error.code === 'NETWORK_ERROR' ||
    errorString.includes('network error') ||
    errorString.includes('could not detect network')
  ) {
    return 'Impossible de joindre le réseau Ganache. Vérifiez que Ganache est bien démarré sur le port 7545.';
  }

  // Erreurs Solidity explicites (revert reasons)
  if (error.reason) {
    const knownReverts = {
      'Access denied: Admin only': 'Accès refusé : cette action est réservée à l\'administrateur.',
      'Access denied: Entrepreneur only': 'Accès refusé : cette action est réservée à l\'entrepreneur.',
      'Access denied': 'Accès non autorisé pour ce dossier.',
      'Invalid address': 'Adresse Ethereum invalide.',
      'Invalid role': 'Rôle invalide spécifié.',
      'Cannot reassign administrator': 'Impossible de réassigner le rôle de l\'administrateur.',
      'Cannot revoke this role': 'Ce rôle ne peut pas être révoqué.',
      'Role has no representative': 'Aucun représentant n\'est assigné à ce rôle.',
      'Cafe name required': 'Le nom du café est obligatoire.',
      'Address required': 'L\'adresse de l\'établissement est obligatoire.',
      'Invalid covered area': 'La surface couverte doit être strictement positive (> 0 m²).',
      'Application does not exist': 'Ce dossier n\'existe pas sur la blockchain.',
      'Organization access only': 'Cette opération est réservée aux organismes de validation.',
      'Application not available for review': 'Ce dossier n\'est pas en attente de votre validation.',
      'Wrong organization': 'Vous ne possédez pas les droits de l\'organisme requis.',
      'Invalid organization': 'Organisme de validation invalide.',
      'Validation is not pending': 'Cette validation n\'est pas actuellement en attente.',
      'Rejection reason required': 'Le motif du rejet est obligatoire en cas de refus.',
      'Not application owner': 'Vous n\'êtes pas le propriétaire de ce dossier.',
      'Correction note required': 'La note d\'explication des corrections est obligatoire.',
      'Validation is not rejected': 'Seule une validation rejetée peut faire l\'objet d\'une resoumission.',
      'Initial validations incomplete': 'Les validations de la Municipalité et de la Protection civile doivent être approuvées au préalable.',
      'Tax validation required first': 'L\'approbation de la Recette des Finances est nécessaire avant cette démarche complémentaire.',
      'Tax validation required': 'La validation fiscale est nécessaire.',
      'No employees declared': 'Cette démarche requiert au moins un employé déclaré (nombre d\'employés > 0).',
      'Invalid supplementary organization': 'Organisme complémentaire invalide (seuls RNE et CNSS sont autorisés).',
      'Already requested or processed': 'Cette démarche complémentaire a déjà été demandée ou traitée.'
    };

    if (knownReverts[error.reason]) {
      return knownReverts[error.reason];
    }
    return `Erreur du contrat : ${error.reason}`;
  }

  // Erreur de revert avec require(false) ou message enfoui
  if (errorString.includes('execution reverted')) {
    // Tentative d'extraction de la raison si présente dans shortMessage ou data
    const match = errorString.match(/reason="([^"]+)"/);
    if (match && match[1] && match[1] !== 'require(false)') {
      return `Transaction rejetée par le Smart Contract : ${match[1]}`;
    }
    return 'La transaction a été rejetée par le Smart Contract (conditions de validation non remplies).';
  }

  // Message par défaut
  if (error.shortMessage) {
    return error.shortMessage;
  }

  return message || 'Une erreur est survenue lors de la communication avec la blockchain.';
}
