import { useState, useCallback } from "react";

import {
  createTxRawEIP712,
  signatureToWeb3Extension,
} from "@evmos/transactions";
import { generatePostBodyBroadcast } from "@evmos/provider";
import { bech32 } from "bech32";

export const hexToBech32Address = (address: string, prefix: string): string => {
  const data = Buffer.from(address.substr(2), "hex");
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words);
};

const useSendCosmosTx = (address: string, client: any) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<any>(null);

  const sendCosmosTx = useCallback(
    async (params: any, createTxFunction: any, customFee: any) => {
      setLoading(true);
      setError(null);
      setResponse(null);

      try {
        const api = client.getEndpoint("cosmos-http", "zeta_testnet");
        const accountAddress = hexToBech32Address(address, "zeta");
        const url = `${api}/cosmos/auth/v1beta1/accounts/${accountAddress}`;
        const broadcastURL = `${api}/cosmos/tx/v1beta1/txs`;

        const accountResponse = await fetch(url);
        const accountData = await accountResponse.json();
        const { account } = accountData;
        const { sequence, account_number } = account?.base_account;
        const pubkey = account?.base_account.pub_key.key;

        const chain = { chainId: 7001, cosmosChainId: "athens_7001-1" };
        const sender = {
          accountAddress,
          sequence,
          accountNumber: account_number,
          pubkey,
        };
        const fee = customFee || {
          amount: "4000000000000000",
          denom: "azeta",
          gas: "500000",
        };
        const memo = "";

        const txDetails = { chain, sender, fee, memo, params };
        const tx = createTxFunction(
          ...(Object.values(txDetails) as [any, any, any, string, any])
        );
        const signature = await window.ethereum.request({
          method: "eth_signTypedData_v4",
          params: [address, tx.eipToSign],
        });

        const extension = signatureToWeb3Extension(chain, sender, signature);

        const rawTx = createTxRawEIP712(
          tx.legacyAmino.body,
          tx.legacyAmino.authInfo,
          extension
        );

        const postResponse = await fetch(broadcastURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: generatePostBodyBroadcast({
            message: {
              toBinary() {
                return rawTx.message.serializeBinary();
              },
            },
            path: rawTx.path,
          }),
        });

        const postData = await postResponse.json();
        setResponse(postData);
      } catch (e: any) {
        console.log(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [address, client]
  );

  return { sendCosmosTx, loading, error, response };
};

export default useSendCosmosTx;
