import React, { createContext, useContext, useState, ReactNode } from "react";

export type WalletType = "unisat" | "okx" | "xdefi";

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
    let wallet;

    switch (walletType) {
      case "unisat":
        wallet = (window as any).unisat;
        break;
      case "okx":
        wallet = (window as any).okxwallet;
        break;
      case "xdefi":
        wallet = (window as any).xfi;
        break;
      default:
        console.error("Unsupported wallet type");
        return;
    }

    if (wallet) {
      setLoading({ isLoading: true, walletType });
      try {
        let address;
        switch (walletType) {
          case "unisat":
            address = (await wallet.requestAccounts())[0];
            break;
          case "okx":
            address = (await wallet.bitcoinTestnet.connect()).address;
            break;
          case "xdefi":
            wallet.bitcoin.changeNetwork("testnet");
            address = (await wallet?.bitcoin?.getAccounts())[0];
            break;
        }
        setAddress(address);
      } catch (error) {
        console.error(`Connection to ${walletType} wallet failed:`, error);
      } finally {
        setLoading({ isLoading: false, walletType: null });
      }
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
