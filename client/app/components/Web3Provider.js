"use client";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { base, baseGoerli } from "wagmi/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from "@web3modal/ethereum";

const projectId = "952483bf7a0f5ace4c40eb53967f1368";
const supportedNetworks = [base, baseGoerli];

const { publicClient } = configureChains(supportedNetworks, [
  w3mProvider({ projectId })
]);

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors: w3mConnectors({
    projectId,
    chains: supportedNetworks
  }),
  publicClient
});
const ethereumClient = new EthereumClient(wagmiConfig, supportedNetworks);


export default function Web3Provider({ children }) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        {children}
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
