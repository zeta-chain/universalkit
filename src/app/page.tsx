"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Swap, ConnectBitcoin } from "@/index";

const contract = "0xb459F14260D1dc6484CE56EB0826be317171e91F"; // universal swap contract

const Page = () => {
  return (
    <div className="m-4">
      <div className="flex justify-end gap-2 mb-10">
        <ConnectBitcoin />
        <ConnectButton label="Connect EVM" showBalance={false} />
      </div>
      <div className="flex justify-center">
        <div className="w-[400px]">
          <Swap contract={contract} />
        </div>
      </div>
    </div>
  );
};

export default Page;
