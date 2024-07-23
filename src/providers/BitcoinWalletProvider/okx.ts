export default {
  label: "OKX Wallet",
  name: "okxwallet",
  getAddress: async (wallet: any) => {
    return (await wallet.bitcoinTestnet.connect()).address;
  },
  sendTransaction: async (
    wallet: any,
    {
      to,
      value,
      memo,
    }: {
      to: string;
      value: number;
      memo?: string;
    }
  ) => {
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
