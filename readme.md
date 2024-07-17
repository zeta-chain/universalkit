# Components

```
yarn add @fadeev/swap
```

Should be compatible with a RainbowKit enabled Next.js app, for example:

https://github.com/fadeev/template

Adding a swap component to a app-router Next.js app:

```ts
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Balances,
  useEthersSigner,
  useZetaChainClient,
} from "@fadeev/swap/dist";
import { useAccount, useSwitchChain, useChainId, useWalletClient } from "wagmi";

// universal swap app contract on ZetaChain
// https://github.com/zeta-chain/example-contracts/tree/main/omnichain/swap
const contract = "0xb459F14260D1dc6484CE56EB0826be317171e91F";

const url = "ZETACHAIN_EVM_ENDPOINT";

function Page() {
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const signer = useEthersSigner({ walletClient });
  const client = useZetaChainClient({ signer, url });

  return (
    <div>
      <ConnectButton />
      <div className="flex justify-center">
        <div className="w-[400px]">
          {client && (
            <Swap
              contract={contract}
              client={client}
              switchChain={switchChain}
              address={address}
              chain={chainId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
```
