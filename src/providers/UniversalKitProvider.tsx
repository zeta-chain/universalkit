"use client";

import React, { ReactNode } from "react";
import { BitcoinWalletProvider } from "./BitcoinWalletProvider";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";

export const UniversalKitProvider = ({
  children,
  config,
  client,
}: {
  children: ReactNode;
  config: any;
  client: any;
}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <BitcoinWalletProvider>{children}</BitcoinWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
