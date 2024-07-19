import { useState, useEffect } from "react";
import { createWeb3Name } from "@web3-name-sdk/core";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ethers } from "ethers";
import { formatAddress } from "@/lib/utils";

export const Profile = ({ address }: { address: any }) => {
  const [record, setRecord] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const isAddressValid = ethers.utils.isAddress(address);

  const addr = isAddressValid ? formatAddress(address) : "Invalid address";

  useEffect(() => {
    const resolveAddress = async () => {
      const web3name = createWeb3Name();
      try {
        setIsLoading(true);
        const name = await web3name.getDomainName({
          address,
          queryChainIdList: [7001, 5, 97],
        });
        if (!name) throw new Error("name not found");
        const record = await web3name.getMetadata({ name });
        setRecord(record);
      } catch (error) {
        console.error("Error resolving address:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (address && ethers.utils.isAddress(address)) {
      resolveAddress();
    } else {
      console.error("Invalid address:", address);
    }
  }, [address]);

  return (
    <Button
      variant="outline"
      className="p-2 py-2 flex items-center gap-2 dark:bg-zinc-900"
    >
      {record ? (
        <img
          className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700"
          src={record?.background_image}
        />
      ) : (
        <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
      )}
      <div className="flex flex-col text-left">
        <div className="text-xs font-semibold tracking-wide">
          {isLoading ? <Skeleton className="w-full h-2 my-1" /> : record?.name}
        </div>
        <div className="text-xs">{addr}</div>
      </div>
    </Button>
  );
};
