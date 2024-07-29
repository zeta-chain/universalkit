import React, { createContext, useContext, useState, ReactNode } from "react";
import unisatWallet from "./unisat";
import okxWallet from "./okx";
import xdefiWallet from "./xdefi";
import xverseWallet from "./xverse";

export const walletTypes = {
  unisat: unisatWallet,
  okx: okxWallet,
  xdefi: xdefiWallet,
  xverse: xverseWallet,
};

export type WalletType = keyof typeof walletTypes;

interface WalletContextProps {
  address: string | null;
  publicKey: string | null;
  loading: { isLoading: boolean; walletType: WalletType | null };
  connectedWalletType: WalletType | null;
  connectWallet: (walletType: WalletType) => void;
  disconnect: () => void;
  sendTransaction: (params: {
    to: string;
    value: number;
    memo?: string | undefined;
  }) => Promise<void>;
}

const BitcoinWalletContext = createContext<WalletContextProps | undefined>(
  undefined
);

export const BitcoinWalletProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<{
    isLoading: boolean;
    walletType: WalletType | null;
  }>({ isLoading: false, walletType: null });
  const [connectedWalletType, setConnectedWalletType] =
    useState<WalletType | null>(null);

  const connectWallet = async (walletType: WalletType) => {
    setAddress(null);
    const walletConfig = walletTypes[walletType];

    setLoading({ isLoading: true, walletType });
    try {
      const { address, publicKey } = await walletConfig.getAddress();
      setAddress(address);
      setPublicKey(publicKey);
      setConnectedWalletType(walletType);
    } catch (error) {
      console.error(`Connection to ${walletConfig.label} failed:`, error);
      setLoading({ isLoading: false, walletType: null });
      return;
    }
    setLoading({ isLoading: false, walletType: null });
  };

  const disconnect = () => {
    setAddress(null);
    setConnectedWalletType(null);
  };

  const sendTransaction = async (params: {
    to: string;
    value: number;
    memo?: string | undefined;
  }) => {
    if (!connectedWalletType) {
      console.error("No wallet connected");
      return;
    }

    const walletConfig = walletTypes[connectedWalletType];
    try {
      const txHash = await walletConfig.sendTransaction(params);
      console.log(`Broadcasted a transaction: ${txHash}`);
    } catch (error) {
      console.error(`Transaction with ${walletConfig.label} failed:`, error);
    }
  };

  return (
    <BitcoinWalletContext.Provider
      value={{
        address,
        publicKey,
        loading,
        connectedWalletType,
        connectWallet,
        disconnect,
        sendTransaction,
      }}
    >
      {children}
    </BitcoinWalletContext.Provider>
  );
};

export const useBitcoinWallet = () => {
  const context = useContext(BitcoinWalletContext);
  if (!context) {
    throw new Error(
      "useBitcoinWallet must be used within a BitcoinWalletProvider"
    );
  }
  return context;
};
