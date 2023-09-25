"use client";
import { Divider, Layout } from "antd";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: 0,
          color: "#fff"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px"
          }}
        >
          <h3>Super Unlockable</h3>
          <ConnectButton
            label="Connect Wallet" // button label
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full"
            }} // or avatar, address, none
            chainStatus={{
              smallScreen: "icon",
              largeScreen: "full"
            }} //or icon, name, none
            showBalance={{
              smallScreen: false,
              largeScreen: true
            }} // or false
          />
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
        <p style={{ fontSize: "12px" }}>v0.30.1</p>
      </Footer>
    </Layout>
  );
}
