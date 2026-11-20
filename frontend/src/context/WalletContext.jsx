import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  isMetaMaskInstalled,
  connectWallet,
  getConnectedAccount,
  getCurrentNetwork,
  switchOrAddGanacheNetwork,
  getContract,
} from "../blockchain/contract";
import { EXPECTED_CHAIN_ID } from "../blockchain/contractConfig";
import { getRoleInfo, getRoleDashboardPath } from "../utils/roleUtils";
import { parseBlockchainError } from "../blockchain/blockchainUtils";
import { ROLES } from "../blockchain/contractConfig";

export const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(ROLES.NONE);
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [adminAddress, setAdminAddress] = useState("");
  const [error, setError] = useState(null);

  /**
   * Récupère le rôle d'une adresse sur le Smart Contract
   */
  const fetchRoleForAccount = useCallback(async (userAddress) => {
    if (!userAddress) {
      setRole(ROLES.NONE);
      return ROLES.NONE;
    }
    try {
      const contract = await getContract(true);
      const userRole = await contract.roleOf(userAddress);
      const roleNum = Number(userRole);
      setRole(roleNum);
      return roleNum;
    } catch (err) {
      console.warn("Impossible de récupérer le rôle pour l'adresse :", err);
      setRole(ROLES.NONE);
      return ROLES.NONE;
    }
  }, []);

  /**
   * Met à jour l'état du réseau
   */
  const checkNetwork = useCallback(async () => {
    try {
      const net = await getCurrentNetwork();
      setChainId(net.chainId);
      const valid = net.chainId.toString() === EXPECTED_CHAIN_ID.toString();
      setIsCorrectNetwork(valid);
      return { chainId: net.chainId, valid };
    } catch (err) {
      setIsCorrectNetwork(false);
      return { chainId: 0, valid: false };
    }
  }, []);

  /**
   * Action de connexion initiée par l'utilisateur
   */
  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const data = await connectWallet();
      setAccount(data.account);
      setChainId(data.network.chainId);
      setIsCorrectNetwork(data.isCorrectNetwork);
      setAdminAddress(data.adminAddress);

      if (data.isCorrectNetwork) {
        const userRole = await fetchRoleForAccount(data.account);
        return {
          account: data.account,
          role: userRole,
          isCorrectNetwork: true,
        };
      } else {
        setError(
          `Vous êtes connecté au réseau Chain ID ${data.network.chainId}. Veuillez basculer sur Ganache (Chain ID ${EXPECTED_CHAIN_ID}).`
        );
        return {
          account: data.account,
          role: ROLES.NONE,
          isCorrectNetwork: false,
        };
      }
    } catch (err) {
      const msg = parseBlockchainError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchRoleForAccount]);

  /**
   * Déconnexion logique de l'application
   */
  const disconnect = useCallback(() => {
    setAccount(null);
    setRole(ROLES.NONE);
    setError(null);
  }, []);

  /**
   * Basculement automatique de réseau vers Ganache
   */
  const switchNetwork = useCallback(async () => {
    setError(null);
    try {
      await switchOrAddGanacheNetwork();
      await checkNetwork();
      if (account) {
        await fetchRoleForAccount(account);
      }
    } catch (err) {
      setError(parseBlockchainError(err));
    }
  }, [account, checkNetwork, fetchRoleForAccount]);

  /**
   * Recharger le rôle courant (après assignation ou révocation)
   */
  const refreshRole = useCallback(async () => {
    if (account) {
      return await fetchRoleForAccount(account);
    }
  }, [account, fetchRoleForAccount]);

  // Initialisation silencieuse au montage
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!isMetaMaskInstalled()) {
        if (mounted) setIsInitializing(false);
        return;
      }

      try {
        const net = await checkNetwork();
        const activeAccount = await getConnectedAccount();

        if (mounted && activeAccount) {
          setAccount(activeAccount);
          if (net.valid) {
            await fetchRoleForAccount(activeAccount);
          }
        }
      } catch (err) {
        console.warn("Échec d'initialisation du wallet :", err);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [checkNetwork, fetchRoleForAccount]);

  // Écoute des événements MetaMask (accountsChanged, chainChanged)
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts && accounts.length > 0) {
        const newAccount = accounts[0];
        setAccount(newAccount);
        setError(null);
        await fetchRoleForAccount(newAccount);
      } else {
        // Utilisateur déconnecté ou verrouillé dans MetaMask
        setAccount(null);
        setRole(ROLES.NONE);
      }
    };

    const handleChainChanged = () => {
      // Recommandation officielle MetaMask lors d'un chainChanged : rafraîchir ou recalculer l'état
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [fetchRoleForAccount]);

  const roleInfo = getRoleInfo(role);
  const isConnected = Boolean(account);

  const value = {
    account,
    role,
    roleInfo,
    chainId,
    isCorrectNetwork,
    isConnected,
    isConnecting,
    isInitializing,
    adminAddress,
    error,
    connect,
    disconnect,
    switchNetwork,
    refreshRole,
    getRoleDashboardPath: () => getRoleDashboardPath(role),
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
