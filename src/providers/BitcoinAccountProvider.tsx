import React, { createContext, useContext, useState, ReactNode } from "react";

interface AccountContextProps {
  account: string | null;
  isLoading: boolean;
  connectWallet: (walletType: "unisat" | "okx" | "xdefi") => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const connectWallet = async (walletType: "unisat" | "okx" | "xdefi") => {
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
      setIsLoading(true);
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
        setIsLoading(false);
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
