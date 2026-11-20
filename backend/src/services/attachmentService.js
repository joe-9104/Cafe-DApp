const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { UPLOAD_DIR } = require('../middleware/upload');

/**
 * Calcule le hash SHA-256 d'un fichier à partir de son chemin
 * @param {string} filePath - Chemin absolu du fichier
 * @returns {Promise<string>} Hash SHA-256 hexadécimal
 */
function calculateFileSha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

/**
 * Enregistre les métadonnées associées à un fichier uploadé
 */
function saveMetadata(metadata) {
  const metaPath = path.join(UPLOAD_DIR, `${metadata.attachmentId}.meta.json`);
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8');
}

/**
 * Récupère les métadonnées d'une pièce jointe
 * @param {string} attachmentId
 * @returns {object|null}
 */
function getMetadata(attachmentId) {
  // Sécuriser l'ID contre les attaques path traversal
  const safeId = path.basename(attachmentId);
  const metaPath = path.join(UPLOAD_DIR, `${safeId}.meta.json`);
  
  if (!fs.existsSync(metaPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(metaPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Erreur lecture métadonnées pour ${attachmentId}:`, err);
    return null;
  }
}

/**
 * Supprime un fichier et ses métadonnées (en cas d'erreur ou d'annulation)
 */
function removeAttachmentFiles(storageReference, attachmentId) {
  try {
    if (storageReference) {
      const filePath = path.join(UPLOAD_DIR, path.basename(storageReference));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (attachmentId) {
      const metaPath = path.join(UPLOAD_DIR, `${path.basename(attachmentId)}.meta.json`);
      if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
    }
  } catch (err) {
    console.warn('Erreur lors du nettoyage de fichier:', err.message);
  }
}

/**
 * Vérifie l'intégrité d'un fichier stocké en recalculant son SHA-256
 */
async function verifyFileIntegrity(attachmentId, expectedSha256 = null) {
  const metadata = getMetadata(attachmentId);
  if (!metadata) {
    return {
      status: 'NOT_FOUND',
      verified: false,
      message: 'Métadonnées introuvables pour cet identifiant.',
    };
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(metadata.storageReference));
  if (!fs.existsSync(filePath)) {
    return {
      status: 'FILE_MISSING',
      verified: false,
      message: 'Le fichier physique est introuvable sur le disque du serveur.',
    };
  }

  const calculatedSha256 = await calculateFileSha256(filePath);
  const targetHash = (expectedSha256 || metadata.sha256 || '').toLowerCase().trim();
  const isValid = calculatedSha256.toLowerCase() === targetHash;

  return {
    status: isValid ? 'VALID' : 'CORRUPTED',
    verified: isValid,
    calculatedSha256,
    expectedSha256: targetHash,
    filename: metadata.filename,
    size: metadata.size,
    message: isValid
      ? 'Intégrité vérifiée : le fichier correspond parfaitement à l\'empreinte SHA-256 enregistrée.'
      : 'Alerte d\'intégrité : le fichier physique a été modifié ou corrompu par rapport à l\'empreinte blockchain.',
  };
}

module.exports = {
  calculateFileSha256,
  saveMetadata,
  getMetadata,
  removeAttachmentFiles,
  verifyFileIntegrity,
};
