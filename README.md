# ☕ Cafe-DApp : Certification Administrative d'un Café sur Blockchain Ethereum

Projet académique simulant la procédure administrative officielle pour l'obtention de la certification d'ouverture d'un café de 1ère catégorie en Tunisie, sur blockchain Ethereum (Ganache).

---

## 🏛️ Architecture du Projet

- **Smart Contract** : `blockchain/contracts/CafeCertification.sol`
  - Déployé sur Ganache : `0x73e6B834F332DA2D99506368d874F072F3c52a7b`
  - ABI : `blockchain/CafeCertification.json`
  - Config : `blockchain/contractConfig.js`
- **Frontend** : `frontend/`
  - React + Vite + Ethers.js v6 + CSS moderne
  - Routeur protégé selon les rôles Solidity
  - Dashboards dédiés pour l'Entrepreneur, la Municipalité, la Protection Civile, la Recette des Finances, le RNE, la CNSS et l'Administrateur.

---

## 🚀 Démarrage Rapide

1. Assurez-vous que Ganache fonctionne sur le port `7545` (Chain ID `1337`).
2. Rendez-vous dans le dossier frontend :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Connectez votre extension MetaMask configurée sur le réseau Ganache Local (`http://127.0.0.1:7545`, ID `1337`).
4. Consultez le guide détaillé dans [frontend/README.md](file:///home/idrislabidi/vscode/Cafe-DApp/frontend/README.md) pour importer les comptes de démonstration et tester l'intégralité du workflow.
