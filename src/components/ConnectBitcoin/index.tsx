"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBitcoinAccount } from "@/providers/BitcoinAccountProvider";
import { Copy, LogOut, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import okxIcon from "./okx.jpeg";
import xdefiIcon from "./xdefi.jpeg";
import unisatIcon from "./unisat.jpeg";

const formatAddress = (str: string): string => {
  if (str.length <= 10) {
    return str;
  }
  const firstPart = str.slice(0, 4);
  const lastPart = str.slice(-4);
  return `${firstPart}...${lastPart}`;
};

export const ConnectBitcoin = () => {
  const { account, isLoading, connectWallet, disconnect } = useBitcoinAccount();

  const Details = () => {
    const [copyStatus, setCopyStatus] = useState(false);
    const [timeoutId, setTimeoutId] = useState<number | null>(null);

    const copyToClipboard = async (text: string, event: React.MouseEvent) => {
      await navigator.clipboard.writeText(text);
      setCopyStatus(true);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = window.setTimeout(() => {
        setCopyStatus(false);
      }, 2000);
      setTimeoutId(newTimeoutId);
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="mx-2 bg-white hover:bg-white font-rounded text-zinc-800 font-bold text-md rounded-xl shadow-rainbowkit hover:scale-1025 transition-all active:scale-95"
          >
            {formatAddress(account as string)}
          </Button>
        </DialogTrigger>
        <DialogContent className="p-4 sm:max-w-[400px] bg-zinc-100 border-white">
          <div className="font-rounded text-[18px] font-[800] text-center">
            {formatAddress(account as string)}
          </div>
          <div className="flex gap-2 ">
            <Button
              onClick={(e) => copyToClipboard(account as string, e)}
              className="active:scale-95 rounded-xl flex-col flex-1 w-fit h-fit font-semibold font-rounded text-sm hover bg-white hover:bg-zinc-50 hover:scale-1025 transition-all"
              variant="ghost"
            >
              {copyStatus ? (
                <Check className="w-4 h-4 m-1" strokeWidth="2.5" />
              ) : (
                <Copy className="w-4 h-4 m-1" strokeWidth="2.5" />
              )}
              <div>{copyStatus ? "Copied!" : "Copy Address"}</div>
            </Button>
            <Button
              onClick={disconnect}
              className="active:scale-95 rounded-xl flex-col flex-1 w-fit h-fit font-rounded text-sm hover bg-white hover:bg-zinc-50 hover:scale-1025 transition-all"
              variant="ghost"
            >
              <LogOut className="w-4 h-4 m-1" strokeWidth="2.5" />
              <div>Disconnect</div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const Connect = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="mx-2 bg-white hover:bg-white font-rounded text-zinc-800 font-bold text-md rounded-xl shadow-rainbowkit hover:scale-1025 transition-all active:scale-95"
          >
            Connect Bitcoin
          </Button>
        </DialogTrigger>
        <DialogContent className="p-4 sm:max-w-[400px]">
          <DialogTitle className="font-rounded font-bold">
            Connect a Bitcoin Wallet
          </DialogTitle>
          <div className="flex gap-2 justify-between pt-5 px-2 items-start">
            <Button
              onClick={() => connectWallet("okx")}
              disabled={isLoading}
              variant="link"
              size="icon"
              className="active:scale-95 p-1 w-fit h-fit flex flex-col items-center hover:no-underline hover:scale-1025 transition-all cursor-pointer"
            >
              <Image
                className="rounded-xl"
                src={okxIcon}
                width="75"
                height="75"
                alt="OKX wallet"
              />
              <div className="py-1 font-rounded font-medium text-sm">OKX</div>
            </Button>
            <Button
              onClick={() => connectWallet("xdefi")}
              disabled={isLoading}
              variant="link"
              size="icon"
              className="active:scale-95 p-1 w-fit h-fit flex flex-col items-center hover:no-underline hover:scale-1025 transition-all cursor-pointer"
            >
              <Image
                className="rounded-xl"
                src={xdefiIcon}
                width="75"
                height="75"
                alt="XDEFI wallet"
              />
              <div className="py-1 font-rounded font-medium text-sm">XDEFI</div>
            </Button>
            <Button
              onClick={() => connectWallet("unisat")}
              disabled={isLoading}
              variant="link"
              size="icon"
              className="active:scale-95 p-1 w-fit h-fit flex flex-col items-center hover:no-underline hover:scale-1025 transition-all cursor-pointer"
            >
              <Image
                className="rounded-xl"
                src={unisatIcon}
                width="75"
                height="75"
                alt="UniSat wallet"
              />
              <div className="py-1 font-rounded font-medium text-sm">
                UniSat
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return <div>{account ? <Details /> : <Connect />}</div>;
};
