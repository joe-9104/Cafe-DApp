const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// S'assurer que le dossier uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuration du stockage disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Générer un identifiant unique sécurisé pour le nom sur disque
    const uniqueId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    req.attachmentId = uniqueId;
    req.storageReference = `${uniqueId}${ext}`;
    cb(null, req.storageReference);
  },
});

// Filtre des types MIME autorisés (PDF, JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Format de fichier non autorisé (${file.mimetype}). Seuls les formats PDF, JPG et PNG sont acceptés.`
    );
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo
  },
});

module.exports = {
  upload,
  UPLOAD_DIR,
};
