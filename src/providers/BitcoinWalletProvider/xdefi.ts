export default {
  label: "XDEFI Wallet",
  name: "xfi",
  getAddress: async (wallet: any) => {
    wallet.bitcoin.changeNetwork("testnet");
    return (await wallet?.bitcoin?.getAccounts())[0];
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
    wallet.bitcoin.changeNetwork("testnet");
    const account = (await wallet?.bitcoin?.getAccounts())?.[0];
    if (!account) throw new Error("No account found");
    const tx = {
      method: "transfer",
      params: [
        {
          feeRate: 10,
          from: account,
          recipient: to,
          amount: {
            amount: value * 1e8,
            decimals: 8,
          },
          memo: `hex::${memo}`,
        },
      ],
    };
    console.log(tx);
    return new Promise((resolve, reject) => {
      wallet.bitcoin.request(tx, (err: Error, res: Response) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  },
};
