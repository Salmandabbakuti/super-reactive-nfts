"use client";
import { Divider, Layout } from "antd";
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
          <w3m-button
            style={{
              backgroundColor: "#fff",
              borderRadius: "25px"
            }}
            size="sm"
            loadingLabel="Connecting..."
            label="Connect Wallet"
            balance="show"
          />
        </div>
      </Header>
      <Content
        style={{
          margin: "12px 8px",
          padding: 12,
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
