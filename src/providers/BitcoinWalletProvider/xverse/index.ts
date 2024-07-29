import { AddressPurpose, BaseAdapter } from "@sats-connect/core";
import { createTransaction, signPsbt } from "./utils";

export default {
  label: "Xverse Wallet",
  name: "xverse",
  getAddress: async () => {
    const adapter = new BaseAdapter("XverseProviders.BitcoinProvider");
    const accounts: any = await adapter.request("getAccounts", {
      purposes: [AddressPurpose.Payment, AddressPurpose.Payment],
    });
    console.log(accounts);
    return {
      address: accounts.result[0].address,
      publicKey: accounts.result[0].publicKey,
    };
  },
  sendTransaction: async ({
    to,
    value,
    memo,
  }: {
    to: string;
    value: number;
    memo?: string;
  }) => {
    const adapter = new BaseAdapter("XverseProviders.BitcoinProvider");
    const accounts: any = await adapter.request("getAccounts", {
      purposes: [AddressPurpose.Payment, AddressPurpose.Payment],
    });
    const address = accounts.result[0].address;
    const publicKey = accounts.result[0].publicKey;

    const result = await createTransaction(publicKey, address, {
      memo,
      amount: value * 1e8,
      to,
    });

    const res = await signPsbt(result.psbtB64, result.utxoCnt, address);
    console.log(res);
  },
};
