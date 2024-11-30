"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { roundNumber } from "@/lib/utils";
import { useBitcoinWallet } from "@/index";
import { useAccount, useWalletClient } from "wagmi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useZetaChainClient, wagmiContextValue } from "@/providers/UniversalKitProvider";

interface Token {
  id: string;
  symbol: string;
  chain_name: string;
  balance: string;
}

interface BalancesProps {
  config?: any;
  balances?: any;
  wagmiContextValue?: wagmiContextValue;
  onBalanceClick?: (balance: Token) => void;
}

export const Balances = ({
  config,
  balances: balancesProp,
  wagmiContextValue,
  onBalanceClick = () => {},
}: BalancesProps) => {
  const useWagmiAccount = wagmiContextValue?.useAccount || useAccount;
  const { address, status } = useWagmiAccount();

  const { address: bitcoin } = useBitcoinWallet();
  const client = useZetaChainClient();

  const [balances, setBalances] = useState<Token[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  const fetchBalances = useCallback(
    async (reloading = true) => {
      if (reloading) setIsReloading(true);
      try {
        if (client && address) {
          const result = await client.getBalances({
            evmAddress: address,
            btcAddress: bitcoin,
          });
          setBalances(result);
        }
      } catch (error: any) {
        console.error("Error fetching local balances:", error);
      } finally {
        setIsReloading(false);
      }
    },
    [client, address, bitcoin]
  );

  useEffect(() => {
    if (balancesProp) {
      setBalances(balancesProp);
      setIsReloading(false);
    } else if (address) {
      fetchBalances();
    }
  }, [balancesProp, address, bitcoin, fetchBalances]);

  const uniqueChains = Array.from(
    new Set(balances.map((token: Token) => token.chain_name))
  );

  const filteredBalances = balances
    .filter(
      (token: Token) =>
        token.symbol.toLowerCase().includes(search.toLowerCase()) &&
        (selectedChain === "" || token.chain_name === selectedChain)
    )
    .sort(
      (a: Token, b: Token) => parseFloat(b.balance) - parseFloat(a.balance)
    );

  const SearchInput = (
    <div className="p-2">
      <div className="relative flex items-center">
        <Input
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 dark:bg-zinc-900"
        />
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        <Button
          variant="link"
          size="icon"
          className="ml-2 absolute right-0 top-0"
          onClick={() => fetchBalances(true)}
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-500 ${isReloading && "animate-spin"}`}
          />
        </Button>
      </div>
    </div>
  );

  const ChainFilter = (
    <div className="relative overflow-x-auto scrollbar-hide px-2 mr-2">
      <div className="flex">
        {uniqueChains.map((chain) => (
          <Button
            variant="outline"
            size="sm"
            key={chain}
            className={`mr-2 dark:font-light ${
              selectedChain === chain ? "bg-zinc-100 dark:bg-zinc-800" : ""
            }`}
            onClick={() =>
              setSelectedChain(chain === selectedChain ? "" : chain)
            }
          >
            {chain}
          </Button>
        ))}
      </div>
    </div>
  );

  const BalancesList = (filteredBalances: Token[]) => (
    <div className="m-2 max-h-96 overflow-scroll">
      {filteredBalances.map((token: Token) => (
        <div
          key={token.id}
          className="flex justify-between py-2 px-3 dark:hover:bg-zinc-800 hover:bg-gray-100 rounded-md cursor-pointer"
          onClick={() => onBalanceClick(token)}
        >
          <div className="flex flex-col">
            <span className="font-light">{token.symbol}</span>
            <span className="text-gray-500 text-xs">{token.chain_name}</span>
          </div>
          <span>{roundNumber(parseFloat(token.balance))}</span>
        </div>
      ))}
    </div>
  );

  const LoadingSkeleton = (
    <div className="space-y-2 px-2 pb-2 mt-2">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
    </div>
  );

  const ErrorMessage = (
    <div className="p-2 pb-4 text-center text-zinc-400">
      Something went wrong
    </div>
  );

  return (
    <div>
      <Card className="dark:bg-zinc-900 border-none shadow-xl shadow-zeta-grey-100 dark:shadow-none">
        {SearchInput}
        {error ? (
          ErrorMessage
        ) : status === "connected" ? (
          <>
            {ChainFilter}
            {filteredBalances.length > 0
              ? BalancesList(filteredBalances)
              : LoadingSkeleton}
          </>
        ) : (
          LoadingSkeleton
        )}
      </Card>
    </div>
  );
};
