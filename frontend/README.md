# ☕ CafeCertification - Frontend DApp

Application décentralisée (DApp) React / Vite / Ethers.js v6 simulant le workflow administratif officiel pour l'ouverture d'un café de première catégorie en Tunisie, connectée au Smart Contract Solidity déployé sur **Ganache**.

---

## 📋 Table des Matières

1. [Aperçu du Projet](#-aperçu-du-projet)
2. [Workflow Administratif](#-workflow-administratif)
3. [Rôles et Comptes de Démonstration Ganache](#-rôles-et-comptes-de-démonstration-ganache)
4. [Prérequis](#-prérequis)
5. [Configuration & Installation](#-configuration--installation)
6. [Configuration de MetaMask](#-configuration-de-metamask)
7. [Lancement de l'Application](#-lancement-de-lapplication)
8. [Architecture Technique](#-architecture-technique)
9. [Notes Importantes sur le Smart Contract](#-notes-importantes-sur-le-smart-contract)

---

## 🌟 Aperçu du Projet

L'application modélise de manière rigoureuse les étapes administratives d'autorisation :
- **Entrepreneur** : Dépose sa demande, déclare les caractéristiques (surface, salariés), suit la progression et soumet des notes de correction en cas de réserves.
- **Municipalité** : Vérifie la conformité de l'implantation urbaine et de l'adresse.
- **Protection Civile** : Contrôle les conditions de sécurité incendie et d'évacuation.
- **Recette des Finances** : Intervient après approbation conjointe des deux organismes précédents pour valider la fiscalité et clore la certification principale.
- **RNE** (complémentaire facultative) : Traite la démarche d'immatriculation au Registre National des Entreprises.
- **CNSS** (complémentaire facultative) : Traite la démarche relative au personnel salarié.
- **Administrateur** : Supervise l'intégralité des dossiers et gère les représentants des rôles.

---

## 🔄 Workflow Administratif

```
[Création du dossier par l'Entrepreneur]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [ Municipalité ]    [ Protection Civile ]   (Validations initiales en parallèle)
        │                   │
        └─────────┬─────────┘
                  │ (Les deux approuvées)
                  ▼
       [ Recette des Finances ]              (Validation fiscale séquentielle)
                  │
                  ▼
  [ CERTIFICATION PRINCIPALE CLÔTURÉE ]
                  │
        ┌─────────┴─────────┐  (Démarches complémentaires indépendantes & facultatives)
        ▼                   ▼
    [  RNE  ]           [  CNSS  ] (Si nombre d'employés > 0)
```

---

## 👥 Rôles et Comptes de Démonstration Ganache

Le contrat est déployé sur Ganache à l'adresse suivante :
`0x73e6B834F332DA2D99506368d874F072F3c52a7b`

Les comptes suivants sont déjà assignés et opérationnels dans le Smart Contract :

| Rôle Solidity | ID | Organisme / Rôle | Adresse Ganache Configurée |
|---|:---:|---|---|
| **Admin** | `1` | Administrateur Système | `0x0Be6070edC2BCeDC94fBe7Ee95ee036588e3Ad03` |
| **Entrepreneur** | `2` | Promoteur du Café | `0x2b2b54BE0491E411aD194b871fd7fcDFaCd765CB` |
| **Municipality** | `3` | Municipalité | `0xeCAe9aDC83C3ae804c265b34E81a13B7f4Df00a0` |
| **CivilProtection** | `4` | Protection Civile | `0xC9b580e802571910317C2d12c6906ea279B22741` |
| **TaxOffice** | `5` | Recette des Finances | `0x5CC0b54F0D16e0A548F28F1fAB7B33593249Ec1b` |
| **RNE** | `6` | Registre National Entreprises | `0x1661Db8DDfF6F1E56f1CC044b11f56FF33d5f4BB` |
| **CNSS** | `7` | Sécurité Sociale | `0xff1D3A26eBB268d962A80C608C90370170631837` |
| **None** | `0` | Tout autre compte | Redirection vers page d'accès refusé |

---

## 📦 Prérequis

- **Node.js** : v18+ (testé avec Node.js v25)
- **Ganache** : Instance locale en cours d'exécution sur le port `7545` (Chain ID `1337`)
- **MetaMask** : Extension de navigateur installée

---

## ⚙️ Configuration & Installation

1. Accédez au répertoire `frontend/` :
   ```bash
   cd frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Vérifiez les variables d'environnement (`.env`) :
   ```env
   VITE_CONTRACT_ADDRESS=0x73e6B834F332DA2D99506368d874F072F3c52a7b
   VITE_CHAIN_ID=1337
   VITE_NETWORK_NAME=Ganache Local
   VITE_GANACHE_RPC_URL=http://127.0.0.1:7545
   ```

---

## 🦊 Configuration de MetaMask

1. Ouvrez MetaMask et accédez à **Paramètres > Réseaux > Ajouter un réseau manuellement** :
   - **Nom du réseau** : `Ganache Local`
   - **Nouvelle URL de RPC** : `http://127.0.0.1:7545`
   - **ID de chaîne** : `1337`
   - **Symbole de la devise** : `ETH`
2. Cliquez sur **Enregistrer**.
3. Importez les comptes de démonstration en copiant leurs clés privées depuis Ganache :
   - Dans Ganache, cliquez sur l'icône de clé en face du compte souhaité (par exemple le compte Entrepreneur ou Municipalité).
   - Dans MetaMask : Menu des comptes > **Ajouter un compte ou un portefeuille matériel > Importer un compte**.
   - Collez la clé privée.

---

## 🚀 Lancement de l'Application

En mode développement :
```bash
npm run dev
```
L'application démarre sur `http://localhost:3000`.

Pour tester le build de production :
```bash
npm run build
npm run preview
```

---

## 🏗️ Architecture Technique

```
frontend/
├── public/                 # Favicon et assets statiques
├── src/
│   ├── blockchain/         # ABI, configuration et utilitaires Ethers.js v6
│   │   ├── CafeCertification.json # ABI officiel du Smart Contract
│   │   ├── contractConfig.js      # Adresse, rôles, statuts et réseau
│   │   ├── contract.js            # Provider, Signer, Contract factory
│   │   └── blockchainUtils.js     # Formateurs BigInt, dates, traducteur d'erreurs
│   ├── components/
│   │   ├── common/         # Boutons, badges, modales, spinners, alertes
│   │   ├── layout/         # Navbar, Sidebar, AppLayout
│   │   ├── dashboard/      # Cartes métriques, revue d'instruction
│   │   └── applications/   # Timeline, carte de dossier, formulaire
│   ├── context/
│   │   └── WalletContext.jsx # Contexte React MetaMask, rôles, événements
│   ├── hooks/
│   │   └── useWallet.js    # Hook pour consommer le WalletContext
│   ├── pages/              # Dashboards spécifiques par rôle et détails
│   ├── services/
│   │   └── applicationService.js # Appels métier au Smart Contract
│   ├── styles/
│   │   └── global.css      # Thème institutionnel moderne
│   ├── App.jsx             # Routeur et protection des accès selon rôle
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## ⚠️ Notes Importantes sur le Smart Contract

1. **Révocation de rôle (`revokeRole`)** : Conformément à l'ABI et au code Solidity déployé, la fonction `revokeRole(uint8 role)` prend en paramètre le type de rôle (`Role`), et non une adresse. Le contrat révoque le représentant actuel de ce rôle.
2. **Supervision Administrateur (`getAllApplicationIds`)** : La fonction est appelée avec un fallback sur l'itérateur `nextApplicationId` pour assurer une compatibilité totale avec toute version d'historique de déploiement Ganache.
3. **Immuabilité des données du café** : Conformément aux règles Solidity, une fois créé, le dossier ne peut être modifié dans ses paramètres initiaux. En cas de rejet par un organisme, l'entrepreneur soumet une **note de correction explicative** via `resubmitRejectedValidation`.
4. **Données des salariés** : Seul le nombre d'employés (`employeeCount`) est inscrit dans la blockchain. Les détails individuels (nom, prénom, CNSS) saisis dans le formulaire restent dans l'état local du navigateur afin de respecter la nature publique de la blockchain.
