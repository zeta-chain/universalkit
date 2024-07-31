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
import { useEthersSigner } from "../hooks/useEthersSigner"; // Import your hook for getting the Ethers signer

// Create a context for ZetaChainClient
const ZetaChainClientContext = createContext<any>(null);

// Custom hook to use the ZetaChainClient context
export const useZetaChainClient = () => useContext(ZetaChainClientContext);

const ZetaChainClientProvider = ({
  children,
  zetaChainConfig,
}: {
  children: ReactNode;
  zetaChainConfig?: any;
}) => {
  const { status } = useAccount(); // Use status to track account connection state
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const signer = useEthersSigner({ walletClient });
  const [zetaChainClient, setZetaChainClient] = useState<any>(null);

  useEffect(() => {
    const initializeClient = async () => {
      if (!signer || status !== "connected") return; // Wait until signer is available and connected

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

export const UniversalKitProvider = ({
  children,
  config,
  client,
  zetaChainConfig,
}: {
  children: ReactNode;
  config?: any;
  client: any;
  zetaChainConfig?: any;
}) => {
  return (
    <WagmiProvider config={config || { autoConnect: true }}>
      <QueryClientProvider client={client}>
        <BitcoinWalletProvider>
          <ZetaChainClientProvider zetaChainConfig={zetaChainConfig}>
            {children}
          </ZetaChainClientProvider>
        </BitcoinWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
