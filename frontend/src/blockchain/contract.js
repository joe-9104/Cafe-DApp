import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  EXPECTED_CHAIN_ID,
  EXPECTED_CHAIN_ID_HEX,
  GANACHE_RPC_URL,
} from "./contractConfig";

let cachedProvider = null;

/**
 * Vérifie si MetaMask (ou un provider Web3 compatible) est installé
 * @returns {boolean}
 */
export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/**
 * Récupère ou initialise le provider Ethers.js v6
 * En priorité BrowserProvider si MetaMask est disponible, sinon JsonRpcProvider (fallback lecture)
 * @returns {ethers.BrowserProvider | ethers.JsonRpcProvider}
 */
export function getProvider() {
  if (isMetaMaskInstalled()) {
    if (!cachedProvider) {
      cachedProvider = new ethers.BrowserProvider(window.ethereum, "any");
    }
    return cachedProvider;
  }
  // Fallback direct sur Ganache RPC pour consultation en lecture si aucun wallet
  return new ethers.JsonRpcProvider(GANACHE_RPC_URL);
}

/**
 * Récupère le Signer MetaMask
 * @returns {Promise<ethers.Signer>}
 */
export async function getSigner() {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      "MetaMask n'est pas détecté. Veuillez installer l'extension MetaMask."
    );
  }
  const provider = getProvider();
  return await provider.getSigner();
}

/**
 * Récupère le compte actuellement connecté dans MetaMask
 * @returns {Promise<string|null>} Adresse du compte ou null
 */
export async function getConnectedAccount() {
  if (!isMetaMaskInstalled()) return null;
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (err) {
    console.error("Erreur lors de la récupération du compte:", err);
    return null;
  }
}

/**
 * Récupère le réseau actuel et son Chain ID
 * @returns {Promise<{ chainId: number, chainIdHex: string, name: string }>}
 */
export async function getCurrentNetwork() {
  const provider = getProvider();
  try {
    const network = await provider.getNetwork();
    const chainIdNum = Number(network.chainId);
    return {
      chainId: chainIdNum,
      chainIdHex: "0x" + chainIdNum.toString(16),
      name: network.name || `Chain ID ${chainIdNum}`,
    };
  } catch (err) {
    console.error("Erreur lors de la détection du réseau:", err);
    return {
      chainId: 0,
      chainIdHex: "0x0",
      name: "Inconnu",
    };
  }
}

/**
 * Tente de basculer MetaMask vers le réseau Ganache configuré ou de l'ajouter
 */
export async function switchOrAddGanacheNetwork() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask n'est pas disponible.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: EXPECTED_CHAIN_ID_HEX }],
    });
  } catch (switchError) {
    // Code 4902 : le réseau n'existe pas encore dans MetaMask, on l'ajoute
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: EXPECTED_CHAIN_ID_HEX,
              chainName: "Ganache Local (CafeCertification)",
              rpcUrls: [GANACHE_RPC_URL],
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        throw new Error(
          "Impossible d'ajouter le réseau Ganache dans MetaMask : " +
            addError.message
        );
      }
    } else {
      throw switchError;
    }
  }
}

/**
 * Initialise l'instance du Smart Contract CafeCertification
 * @param {boolean} readOnly - Si true, utilise le provider; si false, utilise le signer
 * @returns {Promise<ethers.Contract>}
 */
export async function getContract(readOnly = false) {
  if (readOnly) {
    const provider = getProvider();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }

  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Connecte le wallet de l'utilisateur et effectue les vérifications initiales
 * @returns {Promise<{
 *   account: string,
 *   signer: ethers.Signer,
 *   network: { chainId: number, name: string },
 *   isCorrectNetwork: boolean,
 *   adminAddress: string
 * }>}
 */
export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      "MetaMask n'est pas installé. Veuillez installer l'extension MetaMask pour utiliser cette DApp."
    );
  }

  // Demande de permission à MetaMask
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("Aucun compte sélectionné dans MetaMask.");
  }

  const account = accounts[0];
  cachedProvider = new ethers.BrowserProvider(window.ethereum, "any");
  const signer = await cachedProvider.getSigner();
  const network = await getCurrentNetwork();

  const isCorrectNetwork =
    network.chainId.toString() === EXPECTED_CHAIN_ID.toString();

  // Test d'accessibilité du contrat et récupération de l'administrateur
  let adminAddress = "";
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      cachedProvider
    );
    adminAddress = await contract.administrator();
  } catch (err) {
    console.warn(
      "Avertissement lors de la lecture de l'administrateur (réseau non synchronisé ou contrat non déployé sur ce réseau) :",
      err.message
    );
  }

  return {
    account,
    signer,
    network,
    isCorrectNetwork,
    adminAddress,
  };
}
