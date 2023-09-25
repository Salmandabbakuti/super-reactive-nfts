"use client";
import { useState, useEffect } from "react";
import {
  RainbowKitProvider,
  lightTheme,
  getDefaultWallets,
  connectorsForWallets
} from "@rainbow-me/rainbowkit";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { base } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  "952483bf7a0f5ace4c40eb53967f1368";
const supportedChains = [base];

import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  supportedChains,
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "Super Unlockable",
  projectId,
  chains
});

const connectors = connectorsForWallets(wallets);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={supportedChains}
        initialChain={base}
        showRecentTransactions={true}
        modalSize="compact"
        // avatar={() => <img src="/favicon.ico" width={50} height={50} />}
        theme={lightTheme()}
        appInfo={{
          appName: "Super Unlockable",
          learnMoreUrl: "https://www.rainbowkit.com/",
          disclaimer: () => (
            <p>
              Super Unlockable - Unleash the power of NFTs with Super Unlockable
            </p>
          )
        }}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
