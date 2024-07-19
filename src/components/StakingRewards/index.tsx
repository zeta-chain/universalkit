import { bech32 } from "bech32";
import { createTxMsgMultipleWithdrawDelegatorReward } from "@evmos/transactions";
import useSendCosmosTx from "@/hooks/useSendCosmosTx";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, LoaderCircle } from "lucide-react";
import { roundNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const hexToBech32Address = (address: string, prefix: string): string => {
  const data = Buffer.from(address.substr(2), "hex");
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words);
};

export const StakingRewards = ({ client, account }: any) => {
  const { sendCosmosTx } = useSendCosmosTx(account.address, client);
  const { address, isConnected, isDisconnected } = account;

  const [unbondingDelegations, setUnbondingDelegations] = useState([]);
  const [stakingDelegations, setStakingDelegations] = useState([]);
  const [stakingRewards, setStakingRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  const api = client.getEndpoint("cosmos-http", "zeta_testnet");

  const fetchUnbondingDelegations = async () => {
    try {
      const addr = hexToBech32Address(account.address, "zeta");
      const url = `${api}/cosmos/staking/v1beta1/delegators/${addr}/unbonding_delegations`;
      const response = await fetch(url);
      const data = await response.json();
      return data.unbonding_responses;
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStakingDelegations = async () => {
    try {
      const addr = hexToBech32Address(account.address, "zeta");
      const url = `${api}/cosmos/staking/v1beta1/delegations/${addr}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.delegation_responses;
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStakingRewards = async () => {
    try {
      const addr = hexToBech32Address(account.address, "zeta");
      const url = `${api}/cosmos/distribution/v1beta1/delegators/${addr}/rewards`;
      const response = await fetch(url);
      const stakingRewards = await response.json();
      return stakingRewards.rewards;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching data...");
      const [unbondingDelegations, stakingDelegations, stakingRewards] =
        await Promise.all([
          fetchUnbondingDelegations(),
          fetchStakingDelegations(),
          fetchStakingRewards(),
        ]);

      setUnbondingDelegations(unbondingDelegations);
      setStakingDelegations(stakingDelegations);
      setStakingRewards(stakingRewards);
    };
    if (account.address) fetchData();
  }, [account.address]);

  const stakingAmountTotal =
    stakingDelegations &&
    stakingDelegations.reduce((a: any, c: any) => {
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
      const addr = hexToBech32Address(account.address, "zeta");
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
      <Card className="p-2 flex flex-col gap-4">
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
      <Card className="p-2 flex flex-col gap-2 justify-between">
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
