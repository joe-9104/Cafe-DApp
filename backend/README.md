# 📂 Backend CafeCertification - Service de Stockage des Pièces Jointes

Microservice Express fournissant l'infrastructure de téléversement, de stockage local et de calcul d'empreinte cryptographique SHA-256 pour les pièces justificatives des dossiers de cafés.

---

## 🚀 Démarrage Rapide

```bash
cd backend
npm install
npm start
```
Le serveur écoute sur `http://localhost:5000`.

---

## 📡 Endpoints API

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/attachments/upload` | Téléverse un fichier (PDF, JPG, PNG ≤ 5 Mo) et retourne son empreinte SHA-256 |
| `GET` | `/api/attachments/:attachmentId` | Visualisation / Aperçu du document en ligne |
| `GET` | `/api/attachments/:attachmentId/download` | Téléchargement du fichier avec son nom d'origine |
| `GET` | `/api/attachments/:attachmentId/verify` | Vérification de l'intégrité SHA-256 du fichier sur disque |
| `GET` | `/api/health` | État de santé du service |

---

## 🔒 Sécurité et Intégrité

- **Formats acceptés** : PDF, JPEG/JPG, PNG uniquement.
- **Taille maximale** : 5 Mo par document.
- **Protection Path Traversal** : Les noms de fichiers réels sur disque sont assignés via des identifiants uniques générés par le serveur (`crypto.randomUUID`), dissociés des chemins d'origine fournis par le client.
- **Certificat Blockchain** : Le Smart Contract enregistre l'empreinte SHA-256 calculée par le backend lors du dépôt.
