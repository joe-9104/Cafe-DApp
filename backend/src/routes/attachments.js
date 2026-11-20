const express = require('express');
const path = require('path');
const fs = require('fs');
const { upload, UPLOAD_DIR } = require('../middleware/upload');
const {
  calculateFileSha256,
  saveMetadata,
  getMetadata,
  verifyFileIntegrity,
  removeAttachmentFiles,
} = require('../services/attachmentService');

const router = express.Router();

/**
 * POST /api/attachments/upload
 * Téléverse un fichier, calcule son SHA-256 et stocke ses métadonnées
 */
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Taille de fichier excessive. La limite maximale autorisée est de 5 Mo.',
        });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: err.message,
        });
      }
      return res.status(400).json({
        error: err.message || 'Erreur lors du téléversement du fichier.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Aucun fichier transmis.',
      });
    }

    try {
      const filePath = req.file.path;
      const sha256 = await calculateFileSha256(filePath);

      const metadata = {
        attachmentId: req.attachmentId,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        sha256,
        storageReference: req.storageReference,
        documentType: req.body.documentType || 'Autre document',
        uploadedAt: new Date().toISOString(),
      };

      saveMetadata(metadata);

      return res.status(201).json({
        attachmentId: metadata.attachmentId,
        filename: metadata.filename,
        mimeType: metadata.mimeType,
        size: metadata.size,
        sha256: metadata.sha256,
        storageReference: metadata.storageReference,
      });
    } catch (calcError) {
      // Nettoyage en cas d'erreur de traitement
      removeAttachmentFiles(req.storageReference, req.attachmentId);
      console.error('Erreur calcul SHA-256 / métadonnées:', calcError);
      return res.status(500).json({
        error: 'Erreur lors du calcul de l\'empreinte cryptographique du fichier.',
      });
    }
  });
});

/**
 * GET /api/attachments/:attachmentId
 * Visualisation / Aperçu en ligne du document
 */
router.get('/:attachmentId', (req, res) => {
  const { attachmentId } = req.params;
  const metadata = getMetadata(attachmentId);

  if (!metadata) {
    return res.status(404).json({ error: 'Pièce jointe introuvable.' });
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(metadata.storageReference));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier physique introuvable sur le serveur.' });
  }

  // Définir le Content-Type pour aperçu natif
  res.setHeader('Content-Type', metadata.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(metadata.filename)}"`);
  res.sendFile(filePath);
});

/**
 * GET /api/attachments/:attachmentId/download
 * Téléchargement avec le nom de fichier original
 */
router.get('/:attachmentId/download', (req, res) => {
  const { attachmentId } = req.params;
  const metadata = getMetadata(attachmentId);

  if (!metadata) {
    return res.status(404).json({ error: 'Pièce jointe introuvable.' });
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(metadata.storageReference));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier physique introuvable sur le serveur.' });
  }

  res.download(filePath, metadata.filename);
});

/**
 * GET /api/attachments/:attachmentId/verify
 * Vérifie l'intégrité du fichier par rapport à son SHA-256 stocké ou fourni en query
 */
router.get('/:attachmentId/verify', async (req, res) => {
  const { attachmentId } = req.params;
  const { expectedHash } = req.query;

  try {
    const result = await verifyFileIntegrity(attachmentId, expectedHash);
    if (!result.verified && result.status === 'NOT_FOUND') {
      return res.status(404).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error('Erreur vérification intégrité:', err);
    return res.status(500).json({
      error: 'Erreur lors de la vérification cryptographique du fichier.',
    });
  }
});

/**
 * DELETE /api/attachments/:attachmentId
 * Nettoyage d'une pièce jointe (si l'entrepreneur annule la transaction blockchain)
 */
router.delete('/:attachmentId', (req, res) => {
  const { attachmentId } = req.params;
  const metadata = getMetadata(attachmentId);

  if (!metadata) {
    return res.status(404).json({ error: 'Pièce jointe introuvable.' });
  }

  removeAttachmentFiles(metadata.storageReference, metadata.attachmentId);
  return res.json({ message: 'Fichier et métadonnées nettoyés avec succès.' });
});

module.exports = router;
