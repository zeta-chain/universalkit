import { createTxMsgMultipleWithdrawDelegatorReward } from "@evmos/transactions";
import useSendCosmosTx from "@/hooks/useSendCosmosTx";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { roundNumber, hexToBech32Address } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useWalletClient } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useZetaChainClient } from "@/hooks/useZetaChainClient";

interface StakingRewardsProps {
  config?: any;
}

export const StakingRewards = ({ config }: StakingRewardsProps) => {
  const { address, chainId, isConnected, isDisconnected }: any = useAccount();
  const { data: walletClient } = useWalletClient({ chainId });
  const signer = useEthersSigner({ walletClient });
  const client = useZetaChainClient(config || { network: "testnet", signer });

  const { sendCosmosTx } = useSendCosmosTx(address, client);

  const [unbondingDelegations, setUnbondingDelegations] = useState([]);
  const [stakingDelegations, setStakingDelegations] = useState([]);
  const [stakingRewards, setStakingRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnbondingDelegations = async (api: string) => {
    try {
      const addr = hexToBech32Address(address, "zeta");
      const url = `${api}/cosmos/staking/v1beta1/delegators/${addr}/unbonding_delegations`;
      const response = await fetch(url);
      const data = await response.json();
      return data.unbonding_responses;
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStakingDelegations = async (api: string) => {
    try {
      const addr = hexToBech32Address(address, "zeta");
      const url = `${api}/cosmos/staking/v1beta1/delegations/${addr}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.delegation_responses;
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStakingRewards = async (api: string) => {
    try {
      const addr = hexToBech32Address(address, "zeta");
      const url = `${api}/cosmos/distribution/v1beta1/delegators/${addr}/rewards`;
      const response = await fetch(url);
      const stakingRewards = await response.json();
      return stakingRewards.rewards;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (client) {
      const api = client.getEndpoint("cosmos-http", "zeta_testnet");
    }
  }, [client]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching data...");
      const api = client.getEndpoint("cosmos-http", "zeta_testnet");
      const [unbondingDelegations, stakingDelegations, stakingRewards] =
        await Promise.all([
          fetchUnbondingDelegations(api),
          fetchStakingDelegations(api),
          fetchStakingRewards(api),
        ]);

      setUnbondingDelegations(unbondingDelegations);
      setStakingDelegations(stakingDelegations);
      setStakingRewards(stakingRewards);
    };
    if (address && client) fetchData();
  }, [address, client]);

  const stakingAmountTotal = stakingDelegations?.reduce((a: any, c: any) => {
    const amount = BigInt(c.balance.amount);
    return a + amount;
  }, BigInt(0));

  const unbondingDelegationsTotal =
    unbondingDelegations &&
    unbondingDelegations.reduce((totalSum: any, delegator: any) => {
      const delegatorSum = delegator.entries.reduce((sum: any, entry: any) => {
        return sum + BigInt(entry.balance);
      }, BigInt(0));
      return BigInt(totalSum) + BigInt(delegatorSum);
    }, 0);

  const stakingRewardsTotal =
    stakingRewards &&
    stakingRewards.reduce((a: any, c: any) => {
      if (c.reward && c.reward.length > 0) {
        const azetaReward = c.reward.find((r: any) => r.denom === "azeta");
        if (azetaReward) {
          return a + parseFloat(azetaReward.amount);
        }
      }
      return a;
    }, 0);

  const claimRewards = async () => {
    try {
      setLoading(true);
      const addr = hexToBech32Address(address, "zeta");
      if (!addr) {
        console.error("Invalid address");
        return;
      }
      const url = `${api}/cosmos/distribution/v1beta1/delegators/${addr}/rewards`;
      const response = await fetch(url);
      const stakingRewards = await response.json();
      const validatorAddresses = stakingRewards.rewards.map(
        (r: any) => r.validator_address
      );
      const customFee = {
        amount: "4000000000000000",
        denom: "azeta",
        gas: (validatorAddresses.length * 200000).toString(),
      };
      const result = await sendCosmosTx(
        { validatorAddresses },
        createTxMsgMultipleWithdrawDelegatorReward,
        customFee
      );
      console.log(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-2 flex flex-col gap-4 dark:bg-zinc-900 dark:border-none">
        <div className="px-2">
          <div className="text-xs text-muted-foreground">Staked</div>
          {isConnected ? (
            <div className="text-xl font-light">
              {formatUnits(stakingAmountTotal, 18)} ZETA
            </div>
          ) : (
            <Skeleton className="w-full h-6 mt-1 animate-none" />
          )}
        </div>
        <div className="px-2">
          <div className="text-xs text-muted-foreground">Unstaking</div>
          {isConnected ? (
            <div className="text-xl font-light">
              {formatUnits(unbondingDelegationsTotal, 18)} ZETA
            </div>
          ) : (
            <Skeleton className="w-full h-6 mt-1 animate-none" />
          )}
        </div>
      </Card>
      <Card className="p-2 flex flex-col gap-2 justify-between dark:bg-zinc-900 dark:border-none">
        <div className="px-2">
          <div className="text-xs text-muted-foreground">Rewards</div>
          {isConnected ? (
            <div className="text-xl font-light">
              {roundNumber(parseFloat(formatUnits(stakingRewardsTotal, 18)))}
              ZETA
            </div>
          ) : (
            <Skeleton className="w-full h-6 mt-1 animate-none" />
          )}
        </div>
        <Button
          disabled={loading || isDisconnected}
          className="w-full"
          variant="outline"
          onClick={claimRewards}
        >
          <div className="flex gap-1 items-center">
            <div>Claim rewards</div>
          </div>
        </Button>
      </Card>
    </div>
  );
};
