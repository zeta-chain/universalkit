export const okxWallet = {
  label: "OKX Wallet",
  name: "okx",
  getAddress: async (wallet: any) => {
    return (await wallet.bitcoinTestnet.connect()).address;
  },
  sendTransaction: async (wallet: any, tx: any) => {
    return await wallet.bitcoinTestnet.sendTransaction(tx);
  },
};
