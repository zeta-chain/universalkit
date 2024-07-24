import React, { ReactNode } from "react";
import { BitcoinWalletProvider } from "./BitcoinWalletProvider";

export const UniversalKitProvider = ({ children }: { children: ReactNode }) => {
  return <BitcoinWalletProvider>{children}</BitcoinWalletProvider>;
};
