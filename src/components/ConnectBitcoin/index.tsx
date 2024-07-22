"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  useBitcoinWallet,
  WalletType,
} from "@/providers/BitcoinWalletProvider";
import { Copy, LogOut, Check, LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image, { StaticImageData } from "next/image";
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

const WalletButton = React.memo(
  ({
    walletType,
    icon,
    label,
    connectWallet,
    loading,
  }: {
    walletType: WalletType;
    icon: StaticImageData;
    label: string;
    connectWallet: (walletType: WalletType) => void;
    loading: any;
  }) => (
    <Button
      onClick={() => connectWallet(walletType)}
      disabled={loading.isLoading && loading.walletType === walletType}
      variant="link"
      size="icon"
      className={`filter active:brightness-50 disabled:opacity-100 active:scale-95 p-1 w-fit h-fit flex flex-col items-center hover:no-underline hover:scale-1025 transition-all cursor-pointer ${
        loading.isLoading && loading.walletType === walletType
          ? "scale-95 brightness-50 hover:scale-95"
          : ""
      }`}
    >
      <Image
        className="rounded-xl"
        src={icon}
        width="75"
        height="75"
        alt={`${label} wallet`}
      />
      <div className="py-1 font-rounded font-medium text-sm">
        {loading.isLoading && loading.walletType === walletType ? (
          <div>
            <LoaderCircle className="w-4 h-4 animate-spin opacity-50" />
          </div>
        ) : (
          label
        )}
      </div>
    </Button>
  )
);

const Details = React.memo(({ address, disconnect }: any) => {
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
          className="mx-2 dark:hover:text-primary-foreground bg-white hover:bg-white font-rounded text-zinc-800 font-bold text-md rounded-xl shadow-rainbowkit hover:scale-1025 transition-all active:scale-95"
        >
          {formatAddress(address as string)}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-5 sm:max-w-[400px] bg-zinc-100 dark:bg-background light:border-white shadow-xl">
        <div className="font-rounded text-[18px] font-[800] text-center">
          {formatAddress(address as string)}
        </div>
        <div className="flex gap-2 ">
          <Button
            onClick={(e) => copyToClipboard(address as string, e)}
            className="active:scale-95 rounded-xl flex-col flex-1 w-fit h-fit font-semibold font-rounded text-sm hover dark:bg-zinc-900 bg-white hover:bg-zinc-50 hover:scale-1025 transition-all"
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
            className="active:scale-95 rounded-xl flex-col flex-1 w-fit h-fit font-semibold font-rounded text-sm hover dark:bg-zinc-900 bg-white hover:bg-zinc-50 hover:scale-1025 transition-all"
            variant="ghost"
          >
            <LogOut className="w-4 h-4 m-1" strokeWidth="2.5" />
            <div>Disconnect</div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

const Connect = React.memo(({ connectWallet, loading }: any) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="mx-2 dark:hover:text-primary-foreground bg-white hover:bg-white font-rounded text-zinc-800 font-bold text-md rounded-xl shadow-rainbowkit hover:scale-1025 transition-all active:scale-95"
        >
          Connect Bitcoin
        </Button>
      </DialogTrigger>
      <DialogContent className="p-5 sm:max-w-[400px]">
        <DialogTitle className="pt-1 font-rounded font-extrabold tracking-normal">
          Connect a Bitcoin Wallet
        </DialogTitle>
        <div className="flex gap-2 justify-between pt-5 px-2 items-start">
          <WalletButton
            walletType="okx"
            icon={okxIcon}
            label="OKX"
            connectWallet={connectWallet}
            loading={loading}
          />
          <WalletButton
            walletType="xdefi"
            icon={xdefiIcon}
            label="XDEFI"
            connectWallet={connectWallet}
            loading={loading}
          />
          <WalletButton
            walletType="unisat"
            icon={unisatIcon}
            label="UniSat"
            connectWallet={connectWallet}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});

export const ConnectBitcoin = () => {
  const { address, loading, connectWallet, disconnect } = useBitcoinWallet();
  const modalComponent = useMemo(() => {
    if (address) {
      return <Details address={address} disconnect={disconnect} />;
    }
    return <Connect connectWallet={connectWallet} loading={loading} />;
  }, [address, loading, connectWallet, disconnect]);

  return <div>{modalComponent}</div>;
};
