"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Balances,
  ConnectBitcoin,
  Profile,
  StakingRewards,
  Swap,
} from "@/index";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAccount } from "wagmi";

const Page = () => {
  const { address } = useAccount();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            UniversalKit Components
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ConnectBitcoin />
            <ConnectButton label="Connect EVM" showBalance={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Balances
            </h2>
            <div>
              <Balances />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Swap
            </h2>
            <div>
              {address ? (
                <Swap contract="0x0000000000000000000000000000000000000000" />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Connect wallet to use Swap
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Profile
            </h2>
            <div>
              {address ? (
                <Profile address={address} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Connect wallet to view Profile
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Staking Rewards
            </h2>
            <div>
              <StakingRewards />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
