"use client";
import { Layout, Divider } from "antd";
import { Web3Button } from "@web3modal/react";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: 0,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 10px"
        }}
      >
        <h3>Super Unlockable</h3>
        <Web3Button
          balance="hide"
          icon="show"
          label="Connect Wallet"
          avatar="show"
        />
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
      <Divider plain />
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} Salman Dabbakuti. Powered Superfluid &
          Base
        </a>
        <p style={{ fontSize: "12px" }}>v0.30.2</p>
      </Footer>
    </Layout>
  );
}
