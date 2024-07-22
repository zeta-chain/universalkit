import React, { createContext, useContext, useState, ReactNode } from "react";

export type WalletType = "unisat" | "okx" | "xdefi";

interface AccountContextProps {
  account: string | null;
  isLoading: { loading: boolean; walletType: WalletType | null };
  connectWallet: (walletType: WalletType) => void;
  disconnect: () => void;
}

const AccountContext = createContext<AccountContextProps | undefined>(
  undefined
);

export const BitcoinAccountProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<{
    loading: boolean;
    walletType: WalletType | null;
  }>({ loading: false, walletType: null });

  const connectWallet = async (walletType: WalletType) => {
    setAccount(null);
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
      setIsLoading({ loading: true, walletType });
      try {
        let account;
        switch (walletType) {
          case "unisat":
            account = (await wallet.requestAccounts())[0];
            break;
          case "okx":
            account = (await wallet.bitcoinTestnet.connect()).address;
            break;
          case "xdefi":
            wallet.bitcoin.changeNetwork("testnet");
            account = (await wallet?.bitcoin?.getAccounts())[0];
            break;
        }
        setAccount(account);
      } catch (error) {
        console.error(`Connection to ${walletType} wallet failed:`, error);
      } finally {
        setIsLoading({ loading: false, walletType: null });
      }
    }
  };

  const disconnect = () => {
    setAccount(null);
  };

  return (
    <AccountContext.Provider
      value={{ account, isLoading, connectWallet, disconnect }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useBitcoinAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error(
      "useBitcoinAccount must be used within a BitcoinAccountProvider"
    );
  }
  return context;
};
