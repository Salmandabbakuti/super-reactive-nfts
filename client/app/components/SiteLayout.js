"use client";
import { useState } from "react";
import { Layout } from "antd";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useDisconnect } from "wagmi";
import { Button, message } from "antd";
import { WalletFilled } from "@ant-design/icons";
import { base } from "wagmi/chains";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  const [loading, setLoading] = useState({ connect: false });
  const { address: account, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open, setDefaultChain } = useWeb3Modal();

  const handleWalletConnection = async () => {
    setLoading({ connect: true });
    try {
      if (isConnected) return disconnectWallet();
      await open();
      setDefaultChain(base);
    } catch (err) {
      console.error("failed to connect wallet: ", err);
      message.error("Failed to connect wallet");
    } finally {
      setLoading({ connect: false });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    message.success("Wallet disconnected");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px"
          }}
        >
          <h3 style={{ color: "white" }}>Super Unlockable</h3>
          <Button
            type="primary"
            onClick={handleWalletConnection}
            icon={<WalletFilled />}
            loading={loading?.connect}
            style={{ borderRadius: 25 }}
          >
            {account
              ? account.slice(0, 8) + "..." + account.slice(-5)
              : "Connect Wallet"}
          </Button>
        </div>
      </Header>
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} Salman Dabbakuti. Powered Superfluid &
          Base
        </a>
        <p style={{ fontSize: "12px" }}>v0.30.1</p>
      </Footer>
    </Layout>
  );
}
