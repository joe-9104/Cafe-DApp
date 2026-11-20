require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const attachmentsRouter = require('./routes/attachments');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configuration CORS
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://127.0.0.1:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/attachments', attachmentsRouter);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CafeCertification Attachments Storage Service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Middleware de gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur non capturée:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Une erreur interne est survenue sur le serveur.',
  });
});

// Démarrage du serveur si exécuté directement
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur Backend CafeCertification actif sur http://localhost:${PORT}`);
    console.log(`📁 Répertoire de stockage des pièces jointes : uploads/`);
  });
}

module.exports = app;
