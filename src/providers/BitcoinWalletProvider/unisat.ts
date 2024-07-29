export default {
  label: "Unisat Wallet",
  name: "unisat",
  getAddress: async () => {
    const wallet = (window as any).unisat;
    const address = (await wallet.requestAccounts())[0];
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
    const wallet = (window as any).unisat;
    await wallet.requestAccounts();
    const memos = memo && [memo.toLowerCase()];
    const tx = await wallet.sendBitcoin(to, value * 1e8, { memos });
    return tx;
  },
};
