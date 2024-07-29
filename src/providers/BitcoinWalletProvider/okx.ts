export default {
  label: "OKX Wallet",
  name: "okxwallet",
  getAddress: async () => {
    const wallet = (window as any).okxwallet;
    const address = (await wallet.bitcoinTestnet.connect()).address;
    return { address, publicKey: null };
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
    const wallet = (window as any).okxwallet;
    const account = await wallet?.bitcoinTestnet?.connect();
    if (!account) throw new Error("No account found");
    const txHash = await wallet.bitcoinTestnet.send({
      from: account.address,
      to,
      value: value * 1e8,
      memo: `0x${memo}`,
      memoPos: 1,
    });
    return txHash;
  },
};
