"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Balances, ConnectBitcoin } from "@/index";
import { Wallet } from "lucide-react";
const Page = () => {
  return (
    <div className="m-4">
      <div className="flex justify-end gap-2 mb-10">
        <ConnectBitcoin className="bg-black border-2 border-gray-700 rounded-sm hover:bg-zinc-900" icon={<Wallet className="w-4 h-4 ml-2" />} />
        <ConnectButton label="Connect EVM" showBalance={false} />
      </div>
      <div className="flex justify-center">
        <div className="w-[400px]">
          <Balances />
        </div>
      </div>
    </div>
  );
};

export default Page;
