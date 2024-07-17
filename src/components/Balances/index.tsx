"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Token {
  id: string;
  symbol: string;
  chain_name: string;
  balance: string;
}

interface BalancesProps {
  client: {
    getBalances: (params: { evmAddress: string }) => Promise<Token[]>;
  };
  account: any;
  onBalanceClick?: (balance: Token) => void;
}

export const Balances = ({
  client,
  account,
  onBalanceClick = () => {},
}: BalancesProps) => {
  const [balances, setBalances] = useState<Token[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const { address, status } = account;
  const [isReloading, setIsReloading] = useState(false);

  const fetchBalances = async (reloading = false) => {
    if (reloading) setIsReloading(true);
    try {
      const result = await client.getBalances({ evmAddress: address });
      setBalances(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (reloading) setIsReloading(false);
    }
  };

  useEffect(() => {
    if (client && address) {
      fetchBalances();
    }
  }, [client, address]);

  useEffect(() => {
    setBalances([]);
    setError(null);
  }, [address]);

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
    <div className="m-2 relative flex items-center">
      <Input
        placeholder="Search tokens..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-9"
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
  );

  const ChainFilter = (
    <div className="relative overflow-x-auto scrollbar-hide px-2">
      <div className="flex">
        {uniqueChains.map((chain) => (
          <Button
            variant="outline"
            size="sm"
            key={chain}
            className={`mr-2 ${
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
            <span>{token.symbol}</span>
            <span className="text-gray-500 text-xs">{token.chain_name}</span>
          </div>
          <span>{parseFloat(token.balance).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );

  const LoadingSkeleton = (
    <div className="space-y-2 px-2 pb-2">
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
      <Card className="dark:bg-zinc-900">
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
