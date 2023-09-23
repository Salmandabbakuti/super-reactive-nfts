"use client";
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
  appName: "SuperUnlockable"
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: supportedChains,
  themeMode: "light",
  defaultChain: base
});

export default function Web3Provider({ children }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}
