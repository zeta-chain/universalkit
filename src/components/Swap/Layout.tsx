"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Send,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { roundNumber } from "@/lib/utils";

interface SwapLayoutProps {
  sendTypeDetails: any;
  sendType: string | null;
  sourceAmount: any;
  setSourceAmount: (value: any) => any;
  sourceTokenSelected: any;
  balancesLoading: boolean;
  sourceBalances: any[];
  setSourceToken: (token: any) => void;
  destinationAmount: string;
  destinationAmountIsLoading: boolean;
  destinationTokenSelected: any;
  destinationBalances: any[];
  setDestinationToken: (token: any) => void;
  computeSendType: (sourceToken: any, destinationToken: any) => string | null;
  addressSelected: any;
  canChangeAddress: boolean;
  isAddressSelectedValid: boolean;
  formatAddress: (address: string) => string;
  customAddress: string;
  setCustomAddress: (address: string) => void;
  isCustomAddressValid: boolean;
  saveCustomAddress: () => void;
  crossChainFee: {
    amount: string | number;
    decimals: number;
    symbol: string;
    formatted: string;
  } | null;
  isRightChain: boolean;
  handleSend: (sendType: any) => void;
  sendDisabled: boolean;
  isSending: boolean;
  sendButtonText: string;
  switchToRightChain: () => any;
  isSwitchingChainsPending: boolean;
}

const SwapLayout: React.FC<SwapLayoutProps> = ({
  sendTypeDetails,
  sendType,
  sourceAmount,
  setSourceAmount,
  sourceTokenSelected,
  balancesLoading,
  sourceBalances,
  setSourceToken,
  destinationAmount,
  destinationAmountIsLoading,
  destinationTokenSelected,
  destinationBalances,
  setDestinationToken,
  computeSendType,
  addressSelected,
  canChangeAddress,
  isAddressSelectedValid,
  formatAddress,
  customAddress,
  setCustomAddress,
  isCustomAddressValid,
  saveCustomAddress,
  crossChainFee,
  isRightChain,
  handleSend,
  sendDisabled,
  isSending,
  sendButtonText,
  switchToRightChain,
  isSwitchingChainsPending,
}) => {
  const [sourceTokenOpen, setSourceTokenOpen] = useState(false);
  const [destinationTokenOpen, setDestinationTokenOpen] = useState(false);
  const [isFeeOpen, setIsFeeOpen] = useState(false);
  const [customAddressOpen, setCustomAddressOpen] = useState(false);

  const confirmCustomAddress = () => {
    saveCustomAddress();
    setCustomAddressOpen(false);
  };

  return (
    <Card className="p-0 px-5 pb-7 pt-2 dark:bg-zinc-900 border-none shadow-xl shadow-zeta-grey-100 dark:shadow-none">
      <h1 className="text-2xl font-bold leading-tight tracking-tight mt-6 mb-4 ml-2">
        {sendTypeDetails[sendType as any]?.title || "Swap"}
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Input
            className="col-span-2 h-full text-xl border-none bg-transparent"
            onChange={(e) => setSourceAmount(e.target.value)}
            placeholder="0"
            value={sourceAmount}
            disabled={isSending || balancesLoading}
            type="number"
            step="any"
          />
          <Popover open={sourceTokenOpen} onOpenChange={setSourceTokenOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={balancesLoading}
                aria-expanded={sourceTokenOpen}
                className="justify-between col-span-2 text-left h-full overflow-x-hidden border-none"
              >
                <div className="flex flex-col w-full items-start">
                  <div className="text-xs w-full flex justify-between">
                    <div>
                      {sourceTokenSelected
                        ? sourceTokenSelected.symbol
                        : "Token"}
                    </div>
                    <div>
                      {sourceTokenSelected &&
                        roundNumber(parseFloat(sourceTokenSelected.balance))}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {sourceTokenSelected
                      ? sourceTokenSelected.chain_name
                      : "Send token"}
                  </div>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-75" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 border-none shadow-2xl">
              <Command>
                <CommandList className="dark:bg-zinc-800">
                  <CommandInput placeholder="Search tokens..." />
                  <CommandEmpty>No available tokens found.</CommandEmpty>
                  <CommandGroup className="max-h-[400px] overflow-y-scroll">
                    {sourceBalances.map((balances: any) => (
                      <CommandItem
                        key={balances.id}
                        className="hover:cursor-pointer dark:hover:bg-zinc-700"
                        value={balances.id}
                        onSelect={(c: any) => {
                          setSourceToken(c === sourceTokenSelected ? null : c);
                          setSourceTokenOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            sourceTokenSelected === balances.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        <div className="w-full">
                          <div className="flex justify-between">
                            <div>{balances.symbol}</div>
                            <div>
                              {roundNumber(parseFloat(balances.balance))}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-400">
                            {balances.chain_name}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="col-span-2 relative">
            <Input
              className="text-xl h-full border-none bg-transparent"
              type="number"
              placeholder=""
              value={destinationAmount}
              disabled={true}
            />
            {destinationAmountIsLoading && (
              <div className="tranzinc-y-[-50%] absolute top-[50%] left-[1rem]">
                <Loader2 className="h-6 w-6 animate-spin opacity-40" />
              </div>
            )}
          </div>
          <Popover
            open={destinationTokenOpen}
            onOpenChange={setDestinationTokenOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={balancesLoading}
                aria-expanded={sourceTokenOpen}
                className="justify-between text-left col-span-2 h-full overflow-x-hidden border-none"
              >
                <div className="flex flex-col w-full items-start">
                  <div className="text-xs">
                    {destinationTokenSelected
                      ? destinationTokenSelected.symbol
                      : "Token"}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {destinationTokenSelected
                      ? destinationTokenSelected.chain_name
                      : "Receive token"}
                  </div>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-75" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 border-none shadow-2xl">
              <Command>
                <CommandList className="dark:bg-zinc-800">
                  <CommandInput placeholder="Search tokens..." />
                  <CommandEmpty>No available tokens found.</CommandEmpty>
                  <CommandGroup className="max-h-[400px] overflow-y-scroll">
                    {destinationBalances?.map((balances: any) => (
                      <CommandItem
                        key={balances.id}
                        className={`hover:cursor-pointer  dark:hover:bg-zinc-700 ${
                          !computeSendType(sourceTokenSelected, balances) &&
                          "opacity-25"
                        }`}
                        value={balances.id}
                        disabled={
                          !computeSendType(sourceTokenSelected, balances)
                        }
                        onSelect={(c) => {
                          setDestinationToken(
                            c === destinationTokenSelected ? null : c
                          );
                          setDestinationTokenOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            destinationTokenSelected === balances.id
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        <div className="w-full">
                          <div className="flex justify-between">
                            <div>{balances.symbol}</div>
                            <div>
                              {roundNumber(parseFloat(balances.balance))}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-400">
                            {balances.chain_name}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-x-2 flex ml-2 mt-6">
          {addressSelected && (
            <Popover
              open={customAddressOpen}
              onOpenChange={setCustomAddressOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  disabled={!canChangeAddress}
                  variant="outline"
                  className="rounded-full text-xs h-6 px-2"
                >
                  {isAddressSelectedValid ? (
                    <UserCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  <div>{formatAddress(addressSelected)}</div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-xl flex p-2 border-none shadow-xl space-x-2 w-[390px] dark:bg-zinc-800">
                <Input
                  className="grow border-none text-xs px-2 bg-transparent"
                  placeholder="Recipient address"
                  onChange={(e) => setCustomAddress(e.target.value)}
                  value={customAddress}
                />
                <div>
                  <Button
                    disabled={!isCustomAddressValid}
                    size="icon"
                    className="dark:border-zinc-900"
                    variant="outline"
                    onClick={confirmCustomAddress}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {crossChainFee?.formatted && (
            <Popover open={isFeeOpen} onOpenChange={setIsFeeOpen}>
              <PopoverTrigger asChild>
                <Button
                  // disabled={true}
                  variant="outline"
                  className="rounded-full text-xs h-6 px-3 whitespace-nowrap overflow-hidden"
                >
                  {crossChainFee.formatted}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-xl w-auto text-xs border-none shadow-2xl dark:bg-zinc-800">
                <div className="font-medium text-center">Cross-Chain Fee</div>
                <div className="text-zinc-400">{crossChainFee?.amount}</div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="ml-2 mt-6">
          {isRightChain ? (
            <div>
              <Button
                variant="outline"
                className="dark:border-none dark:bg-zinc-800 dark:hover:bg-zinc-800/50"
                onClick={handleSend}
                disabled={sendDisabled}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sendButtonText}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={switchToRightChain}
              disabled={isSwitchingChainsPending}
            >
              {isSwitchingChainsPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Switching to {sourceTokenSelected.chain_name}</span>
                </>
              ) : (
                "Switch Network"
              )}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default SwapLayout;
