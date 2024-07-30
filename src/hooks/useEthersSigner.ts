import * as React from "react";
import { providers } from "ethers";

export function walletClientToSigner(walletClient: any) {
  try {
    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new providers.Web3Provider(transport, network);
    const signer = provider.getSigner(account.address);
    return signer;
  } catch (e) {
    console.error(e);
  }
}

export function useEthersSigner({ walletClient }: { walletClient: any }) {
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}
