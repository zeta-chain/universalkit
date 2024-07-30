"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { StakingRewards, ConnectBitcoin } from "@/index";

const Page = () => {
  return (
    <div className="m-4">
      <div className="flex justify-end gap-2 mb-10">
        <ConnectBitcoin />
        <ConnectButton label="Connect EVM" showBalance={false} />
      </div>
      <div className="flex justify-center">
        <div className="w-[400px]">
          <StakingRewards />
        </div>
      </div>
    </div>
  );
};

export default Page;
