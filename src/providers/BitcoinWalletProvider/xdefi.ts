export default {
  label: "XDEFI Wallet",
  name: "xfi",
  getAddress: async () => {
    const wallet = (window as any).xfi;
    wallet.bitcoin.changeNetwork("testnet");
    const address = (await wallet?.bitcoin?.getAccounts())[0];
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
