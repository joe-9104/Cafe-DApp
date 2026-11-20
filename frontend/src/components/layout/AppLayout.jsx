import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useWallet } from "../../hooks/useWallet";
import { Alert } from "../common/Alert";
import { Button } from "../common/Button";
import { EXPECTED_CHAIN_ID } from "../../blockchain/contractConfig";
import { AlertTriangle } from "lucide-react";

export function AppLayout() {
  const { isConnected, isCorrectNetwork, chainId, switchNetwork } = useWallet();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        {isConnected && !isCorrectNetwork && (
          <div style={{ padding: "1rem 2rem 0" }}>
            <div className="alert alert-warning" style={{ alignItems: "center" }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong>Réseau non conforme détecté</strong> : MetaMask est connecté
                au réseau Chain ID {chainId || "inconnu"}. Cette DApp requiert Ganache
                (Chain ID {EXPECTED_CHAIN_ID}). Les transactions et lectures peuvent
                échouer.
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={switchNetwork}
              >
                Basculer sur Ganache
              </Button>
            </div>
          </div>
        )}

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
