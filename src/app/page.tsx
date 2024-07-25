"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConnectBitcoin } from "@/index";
import { useAccount, useChainId, useWalletClient } from "wagmi";

const Page = () => {
  return (
    <div>
      <ConnectBitcoin />
      <ConnectButton />
    </div>
  );
};

export default Page;
