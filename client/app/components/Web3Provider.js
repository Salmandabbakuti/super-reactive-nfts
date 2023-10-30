"use client";
import { useState, useEffect } from "react";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  "952483bf7a0f5ace4c40eb53967f1368";

const polygonMumbai = {
  chainId: 80001,
  name: "Polygon Mumbai",
  currency: "MATIC",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  explorerUrl: "https://mumbai.polygonscan.com"
};

const supportedChains = [polygonMumbai];

const ethersConfig = defaultConfig({
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
  ethersConfig,
  projectId,
  chains: supportedChains,
  defaultChain: polygonMumbai,
  themeMode: "light",
  themeVariables: {
    "--w3m-z-index": 9999
  }
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return mounted && children;
}
