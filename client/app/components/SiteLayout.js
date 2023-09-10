"use client";
import { Layout } from "antd";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0 }}>
        <h3 style={{ textAlign: "center", color: "white" }}>
          Super Unlockable
        </h3>
      </Header>
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%",
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
          ©{new Date().getFullYear()} Salman Dabbakuti. Powered by
          TheGraph & Ant Design
        </a>
      </Footer>
    </Layout>
  );
}

