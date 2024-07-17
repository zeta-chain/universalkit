"use client";

import { useState, useEffect, useMemo } from "react";

export const useZetaChainClient = (params: any) => {
  const [client, setClient] = useState<any>(null);

  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeClient = async () => {
      try {
        const { ZetaChainClient } = await import("@zetachain/toolkit/client");
        const zetaClient = new ZetaChainClient(memoizedParams);

        setClient(zetaClient);
      } catch (error) {
        console.error("Failed to initialize ZetaChainClient:", error);
      }
    };

    initializeClient();
  }, [memoizedParams]);

  return client;
};

export default useZetaChainClient;
