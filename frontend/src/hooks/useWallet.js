import { useContext } from "react";
import { WalletContext } from "../context/WalletContext";

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet doit être utilisé à l'intérieur d'un WalletProvider");
  }
  return context;
}
