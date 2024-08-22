"use client";

import React, {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { BitcoinWalletProvider } from "./BitcoinWalletProvider";
import { WagmiProvider, useAccount, useChainId, useWalletClient } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEthersSigner } from "../hooks/useEthersSigner";

const ZetaChainClientContext = createContext<any>(null);

export const useZetaChainClient = () => useContext(ZetaChainClientContext);

export interface wagmiContextValue {
  useAccount: typeof useAccount;
  useChainId: typeof useChainId;
  useWalletClient: typeof useWalletClient;
}

interface ZetaChainClientProviderProps {
  children: ReactNode;
  zetaChainConfig?: any;
  wagmiContextValue?: wagmiContextValue;
}

const ZetaChainClientProvider = ({
  children,
  zetaChainConfig,
  wagmiContextValue
}: ZetaChainClientProviderProps ) => {  
  const useWagmiAccount = wagmiContextValue?.useAccount || useAccount;
  const useWagmiChainId = wagmiContextValue?.useChainId || useChainId;
  const useWagmiWalletClient = wagmiContextValue?.useWalletClient || useWalletClient;

  const { status } = useWagmiAccount();
  const chainId = useWagmiChainId();
  const { data: walletClient } = useWagmiWalletClient({ chainId });
  const signer = useEthersSigner({ walletClient });

  const [zetaChainClient, setZetaChainClient] = useState<any>(null);

  useEffect(() => {
    const initializeClient = async () => {
      if (!signer || status !== "connected") return;

      try {
        // @ts-ignore
        const { ZetaChainClient } = await import("@zetachain/toolkit/client");
        const zetaClient = new ZetaChainClient({
          network: "testnet",
          signer,
          ...zetaChainConfig,
        });
        setZetaChainClient(zetaClient);
      } catch (error) {
        console.error("Failed to initialize ZetaChainClient:", error);
      }
    };

    initializeClient();
  }, [signer, status, zetaChainConfig]);

  return (
    <ZetaChainClientContext.Provider value={zetaChainClient}>
      {children}
    </ZetaChainClientContext.Provider>
  );
};

export const UniversalKitProvider = ({ children, zetaChainConfig, wagmiContextValue }: ZetaChainClientProviderProps) => {
  return (
    <BitcoinWalletProvider>
      <ZetaChainClientProvider zetaChainConfig={zetaChainConfig} wagmiContextValue={wagmiContextValue}>
        {children}
      </ZetaChainClientProvider>
    </BitcoinWalletProvider>
  );
};
