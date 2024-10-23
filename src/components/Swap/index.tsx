"use client";

import { useEffect, useState, useCallback } from "react";

import SwapLayout from "./Layout";
import useAmountValidation from "./hooks/useAmountValidation";
import useCrossChainFee from "./hooks/useCrossChainFee";
import useDestinationAddress from "./hooks/useDestinationAddress";
import useDestinationAmount from "./hooks/useDestinationAmount";
import useSendTransaction from "./hooks/useSendTransaction";
import { computeSendType, sendTypeDetails } from "./hooks/computeSendType";
import useSwapErrors from "./hooks/useSwapErrors";
import useTokenSelection from "./hooks/useTokenSelection";
import { formatAddress } from "@/lib/utils";
import { useAccount, useSwitchChain } from "wagmi";
import { useZetaChainClient } from "@/providers/UniversalKitProvider";
import { useBitcoinWallet } from "@/index";

interface SwapProps {
  contract: string;
  track?: any;
  balances?: any;
  config?: any;
}

export const Swap: React.FC<SwapProps> = ({
  contract,
  track,
  balances: balancesProp,
  config,
}) => {
  const { address, chainId } = useAccount();
  const { switchChain, isPending: isSwitchingChainsPending } = useSwitchChain();
  const { address: bitcoin } = useBitcoinWallet();
  const client = useZetaChainClient();

  const [sourceAmount, setSourceAmount] = useState("");
  const [isRightChain, setIsRightChain] = useState(true);
  const [sendButtonText, setSendButtonText] = useState("Send tokens");
  const [balances, setBalances] = useState(balancesProp || []);
  const [balancesLoading, setBalancesLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    setBalancesLoading(true);
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
      setBalancesLoading(false);
    }
  }, [client, address, bitcoin]);

  useEffect(() => {
    if (balancesProp) {
      setBalances(balancesProp);
      setBalancesLoading(false);
    } else if (address) {
      fetchBalances();
    }
  }, [balancesProp, address, bitcoin, fetchBalances]);

  const {
    setSourceToken,
    sourceTokenSelected,
    sourceBalances,
    setDestinationToken,
    destinationTokenSelected,
    destinationBalances,
  } = useTokenSelection(balances, bitcoin);

  const { crossChainFee } = useCrossChainFee(
    sourceTokenSelected,
    destinationTokenSelected,
    client
  );

  const switchToRightChain = () => {
    sourceTokenSelected &&
      switchChain({ chainId: Number(sourceTokenSelected.chain_id) });
  };

  const { isAmountGTFee, isAmountLTBalance } = useAmountValidation(
    sourceTokenSelected,
    destinationTokenSelected,
    sourceAmount,
    crossChainFee
  );

  const { destinationAmount, destinationAmountIsLoading } =
    useDestinationAmount(
      sourceTokenSelected,
      destinationTokenSelected,
      sourceAmount,
      crossChainFee,
      balances,
      client
    );

  const { priorityErrors } = useSwapErrors(
    sourceTokenSelected,
    destinationTokenSelected,
    sourceAmount,
    isAmountGTFee,
    isAmountLTBalance,
    destinationAmountIsLoading
  );

  const {
    addressSelected,
    isAddressSelectedValid,
    canChangeAddress,
    customAddress,
    setCustomAddress,
    isCustomAddressValid,
    saveCustomAddress,
  } = useDestinationAddress(address, destinationTokenSelected, bitcoin);

  const { handleSend, isSending } = useSendTransaction(
    sourceTokenSelected,
    destinationTokenSelected,
    sourceAmount,
    addressSelected,
    setSourceAmount,
    contract,
    bitcoin,
    client,
    address,
    track
  );

  const sendType = computeSendType(
    sourceTokenSelected,
    destinationTokenSelected
  );

  const sendDisabled =
    !sendType ||
    !isAmountGTFee ||
    !isAmountLTBalance ||
    isSending ||
    !isAddressSelectedValid ||
    destinationAmountIsLoading ||
    !destinationAmount ||
    balancesLoading;

  useEffect(() => {
    if (isSending) {
      setSendButtonText("Sending...");
    } else if (sendDisabled && priorityErrors.length > 0) {
      setSendButtonText(priorityErrors[0].message);
    } else {
      setSendButtonText("Send Tokens");
    }
  }, [isSending, sendDisabled, priorityErrors, destinationAmountIsLoading]);

  useEffect(() => {
    if (sourceTokenSelected?.chain_name === "btc_testnet") {
      setIsRightChain(true);
    } else if (chainId && sourceTokenSelected) {
      setIsRightChain(
        chainId.toString() === sourceTokenSelected.chain_id.toString()
      );
    }
  }, [chainId, sourceTokenSelected]);

  return (
    <div>
      <SwapLayout
        sendTypeDetails={sendTypeDetails}
        sendType={sendType}
        sourceAmount={sourceAmount}
        setSourceAmount={setSourceAmount}
        sourceTokenSelected={sourceTokenSelected}
        balancesLoading={balancesLoading}
        sourceBalances={sourceBalances}
        setSourceToken={setSourceToken}
        destinationAmount={destinationAmount}
        destinationAmountIsLoading={destinationAmountIsLoading}
        destinationTokenSelected={destinationTokenSelected}
        destinationBalances={destinationBalances}
        setDestinationToken={setDestinationToken}
        computeSendType={computeSendType}
        addressSelected={addressSelected}
        canChangeAddress={canChangeAddress}
        isAddressSelectedValid={isAddressSelectedValid}
        formatAddress={formatAddress}
        customAddress={customAddress}
        setCustomAddress={setCustomAddress}
        isCustomAddressValid={isCustomAddressValid}
        saveCustomAddress={saveCustomAddress}
        crossChainFee={crossChainFee}
        isRightChain={isRightChain}
        handleSend={handleSend}
        sendDisabled={sendDisabled}
        isSending={isSending}
        sendButtonText={sendButtonText}
        switchToRightChain={switchToRightChain}
        isSwitchingChainsPending={isSwitchingChainsPending}
      />
    </div>
  );
};
