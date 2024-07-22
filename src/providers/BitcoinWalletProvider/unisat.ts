export default {
  label: "Unisat Wallet",
  name: "unisat",
  getAddress: async (wallet: any) => {
    return (await wallet.requestAccounts())[0];
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
      memo: string;
    }
  ) => {
    await wallet.requestAccounts();
    const memos = [memo.toLowerCase()];
    const tx = await wallet.sendBitcoin(to, value, { memos });
    return tx;
  },
};
