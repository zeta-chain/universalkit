export const xdefiWallet = {
  label: "XDEFI Wallet",
  name: "xfi",
  getAddress: async (wallet: any) => {
    wallet.bitcoin.changeNetwork("testnet");
    return (await wallet?.bitcoin?.getAccounts())[0];
  },
  sendTransaction: async (wallet: any, tx: any) => {
    return await wallet.bitcoin.sendTransaction(tx);
  },
};
