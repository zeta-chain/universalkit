import { base64, hex } from "@scure/base";
import * as btc from "micro-btc-signer";
import { RpcErrorCode } from "sats-connect";
import { BaseAdapter } from "@sats-connect/core";

const bitcoinTestnet = {
  bech32: "tb",
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

async function fetchUtxo(address: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://mempool.space/testnet/api/address/${address}/utxo`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch UTXO");
    }
    const utxos: any[] = await response.json();

    if (utxos.length === 0) {
      throw new Error("0 Balance");
    }
    return utxos;
  } catch (error) {
    console.error("Error fetching UTXO:", error);
    throw error;
  }
}

async function createTransaction(
  publickkey: string,
  senderAddress: string,
  params: any
): Promise<{ psbtB64: string; utxoCnt: number }> {
  const publicKey = hex.decode(publickkey);

  const p2wpkh = btc.p2wpkh(publicKey, bitcoinTestnet);
  const p2sh = btc.p2sh(p2wpkh, bitcoinTestnet);

  const recipientAddress = params.to;
  if (!senderAddress) {
    throw new Error("Error: no sender address");
  }
  if (!recipientAddress) {
    throw new Error("Error: no recipient address in ENV");
  }

  const output = await fetchUtxo(senderAddress);

  const tx = new btc.Transaction({
    allowUnknowOutput: true,
  });

  let utxoCnt = 0;

  output.forEach((utxo) => {
    tx.addInput({
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: p2sh.script,
        amount: BigInt(utxo.value),
      },
      witnessScript: p2sh.witnessScript,
      redeemScript: p2sh.redeemScript,
    });
    utxoCnt += 1;
  });

  const changeAddress = senderAddress;

  const memo = params.memo.toLowerCase();

  const opReturn = btc.Script.encode(["RETURN", Buffer.from(memo, "utf8")]);
  tx.addOutputAddress(recipientAddress, BigInt(params.amount), bitcoinTestnet);
  tx.addOutput({
    script: opReturn,
    amount: BigInt(0),
  });
  tx.addOutputAddress(changeAddress, BigInt(800), bitcoinTestnet);

  const psbt = tx.toPSBT(0);

  const psbtB64 = base64.encode(psbt);

  return { psbtB64, utxoCnt };
}

async function signPsbt(
  psbtBase64: string,
  utxoCnt: number,
  senderAddress: string
) {
  // Get the PSBT Base64 from the input

  if (!psbtBase64) {
    alert("Please enter a valid PSBT Base64 string.");
    return;
  }

  const sigInputs = new Array(utxoCnt).fill(0, 0, utxoCnt).map((_, i) => i);

  try {
    const adapter = new BaseAdapter("XverseProviders.BitcoinProvider");
    const response = await adapter.request("signPsbt", {
      psbt: psbtBase64,
      allowedSignHash: btc.SignatureHash.ALL,
      broadcast: true,
      signInputs: {
        [senderAddress]: sigInputs,
      },
    });

    if (response.status === "success") {
      alert("PSBT signed successfully!");
    } else {
      if (response.error.code === RpcErrorCode.USER_REJECTION) {
        alert("Request canceled by user");
      } else {
        console.error("Error signing PSBT:", response.error);
        alert("Error signing PSBT: " + response.error.message);
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Error while signing");
  }
}

export { createTransaction, signPsbt };
