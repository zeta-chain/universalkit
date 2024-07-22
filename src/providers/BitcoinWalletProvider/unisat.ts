export const unisatWallet = {
  label: "Unisat Wallet",
  name: "unisat",
  getAddress: async (wallet: any) => {
    return (await wallet.requestAccounts())[0];
  },
  sendTransaction: async (wallet: any, tx: any) => {
    return await wallet.sendTransaction(tx);
  },
};
