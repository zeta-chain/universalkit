import React, { createContext, useContext, useState, ReactNode } from "react";
import { unisatWallet } from "./unisat";
import { okxWallet } from "./okx";
import { xdefiWallet } from "./xdefi";

export const walletTypes = {
  unisat: unisatWallet,
  okx: okxWallet,
  xdefi: xdefiWallet,
};

export type WalletType = keyof typeof walletTypes;

interface WalletContextProps {
  address: string | null;
  loading: { isLoading: boolean; walletType: WalletType | null };
  connectWallet: (walletType: WalletType) => void;
  disconnect: () => void;
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
  const [loading, setLoading] = useState<{
    isLoading: boolean;
    walletType: WalletType | null;
  }>({ isLoading: false, walletType: null });

  const connectWallet = async (walletType: WalletType) => {
    setAddress(null);
    const walletConfig = walletTypes[walletType];
    const wallet = (window as any)[walletConfig.name];

    if (wallet) {
      setLoading({ isLoading: true, walletType });
      try {
        const address = await walletConfig.getAddress(wallet);
        setAddress(address);
      } catch (error) {
        console.error(`Connection to ${walletConfig.label} failed:`, error);
      } finally {
        setLoading({ isLoading: false, walletType: null });
      }
    } else {
      console.error("Unsupported wallet type");
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <BitcoinWalletContext.Provider
      value={{ address, loading, connectWallet, disconnect }}
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
