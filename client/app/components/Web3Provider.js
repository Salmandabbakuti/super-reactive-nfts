"use client";
import { useEffect, useState } from "react";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { base } from "wagmi/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from "@web3modal/ethereum";

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  "952483bf7a0f5ace4c40eb53967f1368";
const supportedChains = [base];

const { publicClient } = configureChains(supportedChains, [
  w3mProvider({ projectId })
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    projectId,
    chains: supportedChains
  }),
  publicClient
});
const ethereumClient = new EthereumClient(wagmiConfig, supportedChains);

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>{mounted && children}</WagmiConfig>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        defaultChain={base}
        themeMode="light"
        themeVariables={{
          "--w3m-button-border-radius": "25px"
        }}
      />
    </>
  );
}
