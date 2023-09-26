"use client";
import { useState, useEffect } from "react";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { WagmiConfig } from "wagmi";
import { base } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  "952483bf7a0f5ace4c40eb53967f1368";
const supportedChains = [base];

const wagmiConfig = defaultWagmiConfig({
  chains: supportedChains,
  projectId,
  metadata: {
    name: "SuperUnlockable",
    description: "SuperUnlockable NFTS that adapt to your streaming activity!",
    url: "https://superunlockable.vercel.app/",
    icons: ["https://avatars.githubusercontent.com/u/37784886"]
  }
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: supportedChains,
  themeMode: "light",
  defaultChain: base
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return <WagmiConfig config={wagmiConfig}>{mounted && children}</WagmiConfig>;
}
