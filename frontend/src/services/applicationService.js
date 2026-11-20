import { getContract } from "../blockchain/contract";
import { safeBigIntToNumber, safeBigIntToString } from "../blockchain/blockchainUtils";

/**
 * Normalise un objet Validation Solidity en objet JavaScript propre
 */
function normalizeValidation(v) {
  if (!v) {
    return {
      status: 0,
      decidedBy: "",
      decidedAt: 0,
      rejectionReason: "",
      correctionNote: "",
      attempts: 0,
    };
  }
  return {
    status: safeBigIntToNumber(v.status),
    decidedBy: v.decidedBy || "",
    decidedAt: safeBigIntToNumber(v.decidedAt),
    rejectionReason: v.rejectionReason || "",
    correctionNote: v.correctionNote || "",
    attempts: safeBigIntToNumber(v.attempts),
  };
}

/**
 * Normalise un objet Application Solidity en objet JavaScript complet et sécurisé
 */
export function normalizeApplication(app, mainStatus = null) {
  if (!app) return null;

  return {
    id: safeBigIntToNumber(app.id),
    owner: app.owner || "",
    cafeName: app.cafeName || "",
    establishmentAddress: app.establishmentAddress || "",
    coveredArea: safeBigIntToNumber(app.coveredArea),
    employeeCount: safeBigIntToNumber(app.employeeCount),
    createdAt: safeBigIntToNumber(app.createdAt),
    municipality: normalizeValidation(app.municipality),
    civilProtection: normalizeValidation(app.civilProtection),
    taxOffice: normalizeValidation(app.taxOffice),
    rne: normalizeValidation(app.rne),
    cnss: normalizeValidation(app.cnss),
    mainStatus: mainStatus !== null ? safeBigIntToNumber(mainStatus) : null,
  };
}

/**
 * Récupère le statut principal d'un dossier depuis le Smart Contract
 */
export async function getMainStatus(applicationId) {
  const contract = await getContract(false);
  const status = await contract.getMainStatus(applicationId);
  return safeBigIntToNumber(status);
}

/**
 * Récupère un dossier spécifique par son ID (accessible par propriétaire ou Admin)
 */
export async function getApplication(applicationId) {
  const contract = await getContract(false);
  const [rawApp, mainStatus] = await Promise.all([
    contract.getApplication(applicationId),
    contract.getMainStatus(applicationId).catch(() => null),
  ]);
  return normalizeApplication(rawApp, mainStatus);
}

/**
 * Récupère la liste des dossiers de l'entrepreneur connecté
 */
export async function getMyApplications() {
  const contract = await getContract(false);
  const ids = await contract.getMyApplicationIds();
  const idList = ids.map((id) => safeBigIntToNumber(id));

  const apps = await Promise.all(
    idList.map(async (id) => {
      try {
        const [rawApp, mainStatus] = await Promise.all([
          contract.getApplication(id),
          contract.getMainStatus(id).catch(() => null),
        ]);
        return normalizeApplication(rawApp, mainStatus);
      } catch (err) {
        console.warn(`Erreur lors du chargement du dossier #${id}:`, err);
        return null;
      }
    })
  );

  return apps.filter(Boolean);
}

/**
 * Récupère la liste des IDs des dossiers en attente pour l'organisme connecté
 */
export async function getPendingApplicationsForOrganization() {
  const contract = await getContract(false);
  const pendingIds = await contract.getPendingApplicationIds();
  const idList = pendingIds.map((id) => safeBigIntToNumber(id));

  const apps = await Promise.all(
    idList.map(async (id) => {
      try {
        const rawApp = await contract.getApplicationForReview(id);
        return normalizeApplication(rawApp);
      } catch (err) {
        console.warn(
          `Erreur lors du chargement en revue du dossier #${id}:`,
          err
        );
        return null;
      }
    })
  );

  return apps.filter(Boolean);
}

/**
 * Récupère tous les dossiers (réservé à l'administrateur)
 * Utilise getAllApplicationIds avec fallback itératif sur nextApplicationId si nécessaire
 */
export async function getAllApplications() {
  const contract = await getContract(false);
  let idList = [];

  try {
    const rawIds = await contract.getAllApplicationIds();
    idList = rawIds.map((id) => safeBigIntToNumber(id));
  } catch (err) {
    console.info(
      "getAllApplicationIds indisponible dans le bytecode actuel, utilisation de nextApplicationId:",
      err.message
    );
    try {
      const nextId = safeBigIntToNumber(await contract.nextApplicationId());
      idList = [];
      for (let i = 1; i < nextId; i++) {
        idList.push(i);
      }
    } catch (e) {
      console.error("Échec de la récupération de nextApplicationId:", e);
      throw e;
    }
  }

  const apps = await Promise.all(
    idList.map(async (id) => {
      try {
        const [rawApp, mainStatus] = await Promise.all([
          contract.getApplication(id),
          contract.getMainStatus(id).catch(() => null),
        ]);
        return normalizeApplication(rawApp, mainStatus);
      } catch (err) {
        console.warn(`Dossier #${id} non consultable par l'admin:`, err);
        return null;
      }
    })
  );

  return apps.filter(Boolean);
}

/**
 * Crée un nouveau dossier de certification de café
 */
export async function createApplication({
  cafeName,
  establishmentAddress,
  coveredArea,
  employeeCount,
}) {
  const contract = await getContract(false);
  const tx = await contract.createApplication(
    cafeName.trim(),
    establishmentAddress.trim(),
    BigInt(coveredArea),
    BigInt(employeeCount)
  );
  const receipt = await tx.wait();
  return { tx, receipt };
}

/**
 * Décide d'une validation (Approuvée ou Rejetée) pour un organisme
 */
export async function decideValidation(applicationId, organizationRole, approved, reason = "") {
  const contract = await getContract(false);
  const tx = await contract.decideValidation(
    BigInt(applicationId),
    organizationRole,
    approved,
    approved ? "" : reason.trim()
  );
  const receipt = await tx.wait();
  return { tx, receipt };
}

/**
 * Soumet une note de correction pour une validation rejetée
 */
export async function resubmitRejectedValidation(applicationId, organizationRole, correctionNote) {
  const contract = await getContract(false);
  const tx = await contract.resubmitRejectedValidation(
    BigInt(applicationId),
    organizationRole,
    correctionNote.trim()
  );
  const receipt = await tx.wait();
  return { tx, receipt };
}

/**
 * Demande une démarche complémentaire (RNE ou CNSS)
 */
export async function requestSupplementaryValidation(applicationId, organizationRole) {
  const contract = await getContract(false);
  const tx = await contract.requestSupplementaryValidation(
    BigInt(applicationId),
    organizationRole
  );
  const receipt = await tx.wait();
  return { tx, receipt };
}

/**
 * Assigne un rôle à une adresse (Admin uniquement)
 */
export async function assignRole(accountAddress, role) {
  const contract = await getContract(false);
  const tx = await contract.assignRole(accountAddress.trim(), role);
  const receipt = await tx.wait();
  return { tx, receipt };
}

/**
 * Révoque un rôle (Admin uniquement) - prend le rôle en paramètre conformément à l'ABI
 */
export async function revokeRole(role) {
  const contract = await getContract(false);
  const tx = await contract.revokeRole(role);
  const receipt = await tx.wait();
  return { tx, receipt };
}

/**
 * Consulte le rôle d'une adresse
 */
export async function getRoleOf(address) {
  const contract = await getContract(true);
  const role = await contract.roleOf(address);
  return safeBigIntToNumber(role);
}

/**
 * Consulte le représentant actuel d'un rôle
 */
export async function getRepresentativeOf(role) {
  const contract = await getContract(true);
  return await contract.representativeOf(role);
}

/**
 * Récupère l'adresse de l'administrateur
 */
export async function getAdministrator() {
  const contract = await getContract(true);
  return await contract.administrator();
}
