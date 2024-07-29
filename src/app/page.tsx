"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Swap,
  useEthersSigner,
  useZetaChainClient,
  ConnectBitcoin,
  useBitcoinWallet,
} from "@/index";
import { useAccount, useChainId, useWalletClient } from "wagmi";

const contract = "0xb459F14260D1dc6484CE56EB0826be317171e91F"; // universal swap contract

const Page = () => {
  const account = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const signer = useEthersSigner({ walletClient });
  const client = useZetaChainClient({ network: "testnet", signer });
  const { address: bitcoinAddress } = useBitcoinWallet();

  return (
    <div className="m-4">
      <div className="flex justify-end gap-2 mb-10">
        <ConnectBitcoin />
        <ConnectButton label="Connect EVM" showBalance={false} />
      </div>
      <div className="flex justify-center">
        <div className="w-[400px]">
          {client && (
            <Swap
              contract={contract}
              client={client}
              account={account}
              bitcoin={bitcoinAddress}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
