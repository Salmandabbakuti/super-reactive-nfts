"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useDisconnect } from "wagmi";
import { base } from "wagmi/chains";
import {
  Button,
  Input,
  message,
  Space,
  Card,
  Popconfirm,
  Statistic,
  Empty,
  Tabs,
  Row,
  Col,
  Divider
} from "antd";
import {
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  WalletFilled,
  ArrowRightOutlined,
  ExportOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";
import CheckoutWidget from "./components/CheckoutWidget";

import {
  contractAddress,
  supportedTokenAddress,
  supportedTokenSymbol,
  calculateFlowRateInTokenPerMonth,
  calculateTotalStreamedSinceLastUpdate,
  contract
} from "./utils";
import styles from "./page.module.css";

dayjs.extend(relativeTime);

export default function Home() {
  const [dataLoading, setDataLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState({ connect: false });
  const [items, setItems] = useState([]);
  const [mintToAddress, setMintToAddress] = useState("");
  const [
    amountStreamedSinceLastUpdate,
    setAmountStreamedSinceLastUpdate
  ] = useState(0);

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
    setStream(null);
    setProvider(null);
    message.success("Wallet disconnected");
  };

  const handleDeleteStream = async () => {
    if (!account || !provider)
      return message.error("Please connect wallet first");
    if (!stream) return message.error("No stream found open to contract");
    try {
      const signer = provider.getSigner();
      const tx = await contract
        .connect(signer)
        .deleteFlowToContract();
      await tx.wait();
      message.success("Stream deleted successfully");
    } catch (err) {
      message.error("Failed to delete stream");
      console.error("failed to delete stream: ", err);
    }
  };

  const handleMintItem = async () => {
    if (!account || !provider)
      return message.error("Please connect wallet first");
    if (!mintToAddress) return message.error("Please enter address to mint to");
    try {
      setLoading({ mintItem: true });
      const signer = provider.getSigner();
      const tx = await contract.connect(signer).mintItem(mintToAddress);
      await tx.wait();
      message.success("Item minted successfully");
      setLoading({ mintItem: false });
    } catch (err) {
      setLoading({ mintItem: false });
      message.error(
        "Failed to mint item. Make sure your stream deposit raised enough to mint item"
      );
      console.error("failed to mint item: ", err);
    }
  };

  const getStreamToContract = async () => {
    setDataLoading(true);
    try {
      const { lastUpdated, flowRate } = await contract
        .connect(provider)
        .getFlowInfo(supportedTokenAddress, account, contractAddress);
      const stream =
        flowRate.toString() === "0"
          ? null
          : {
            lastUpdated: lastUpdated.toString(),
            flowRate: flowRate.toString(),
            sender: account,
            receiver: contractAddress
          };
      console.log("stream: ", stream);
      setStream(stream);
      setDataLoading(false);
    } catch (err) {
      message.error("Failed to get streams to contract");
      setDataLoading(false);
      console.error("failed to get streams to contract: ", err);
    }
  };

  const getItems = async () => {
    setDataLoading(true);
    try {
      const currentTokenId = await contract.connect(provider).currentTokenId();
      console.log("currentTokenId: ", currentTokenId);
      const items = [];
      for (let i = 0; i < currentTokenId.toNumber(); i++) {
        const uri = await contract.connect(provider).tokenURI(i);
        console.log("uri: ", uri);
        const base64Uri = uri.split(",")[1];
        const metadata = JSON.parse(atob(base64Uri));
        console.log("metadata: ", metadata);
        const item = { id: i, ...metadata };
        items.push(item);
      }
      console.log("items: ", items);
      setItems(items);
      setDataLoading(false);
    } catch (err) {
      setDataLoading(false);
      console.error("failed to get items: ", err);
      message.error("Failed to get items");
    }
  };

  useEffect(() => {
    if (account) {
      const provider = new Web3Provider(window.ethereum);
      setProvider(provider);
    }
  }, [account]);

  useEffect(() => {
    if (provider) {
      getStreamToContract();
      getItems();
    }
  }, [provider]);

  useEffect(() => {
    if (stream) {
      const intervalId = setInterval(() => {
        const amountStreamedSinceLastUpdate = calculateTotalStreamedSinceLastUpdate(
          stream?.flowRate,
          stream?.lastUpdated
        );
        setAmountStreamedSinceLastUpdate(amountStreamedSinceLastUpdate);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [stream]);

  return (
    <div>
      <Button
        type="primary"
        onClick={handleWalletConnection}
        icon={<WalletFilled />}
        loading={loading?.connect}
      >
        {account
          ? account.slice(0, 5) + "..." + account.slice(-5)
          : "Connect Wallet"}
      </Button>
      {account && (
        <Tabs
          type="line"
          animated
          style={{ marginBottom: 20 }}
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Account",
              children: (
                <div className={styles.cardContainer}>
                  <Card
                    title="Your Stream to contract"
                    bordered
                    hoverable
                    loading={dataLoading}
                    extra={
                      <Space>
                        <Button
                          title="Refresh"
                          type="default"
                          shape="circle"
                          icon={<SyncOutlined spin={dataLoading} />}
                          onClick={getStreamToContract}
                        />
                        {stream ? (
                          <>
                            <CheckoutWidget title={"Update"} icon={<EditOutlined />} />
                            <Popconfirm
                              title="Are you sure to delete this stream?"
                              onConfirm={handleDeleteStream}
                            >
                              <Button
                                title="Delete"
                                icon={<DeleteOutlined />}
                                type="primary"
                                shape="circle"
                                danger
                              />
                            </Popconfirm>
                          </>
                        ) : (
                          <CheckoutWidget title={"Open Stream"} icon={<PlusCircleOutlined />} />
                        )}
                      </Space>
                    }
                  >
                    {stream ? (
                      <>
                        <div style={{ textAlign: "center" }}>
                          <Statistic
                            title="Total Amount Streamed (Since Updated)"
                            valueStyle={{
                              color: "#10bb35",
                              fontSize: "1.5rem"
                            }}
                            value={`${amountStreamedSinceLastUpdate} ${supportedTokenSymbol}`}
                            precision={9}
                          />
                        </div>
                        <Space>
                          <Card>
                            <Statistic
                              title={
                                <Space>
                                  Sender (You)
                                  <a
                                    href={`https://basescan.org/address/${stream?.sender}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <ExportOutlined title="View on Basescan" />
                                  </a>
                                </Space>
                              }
                              value={
                                stream?.sender?.slice(0, 5) +
                                "..." +
                                stream?.sender?.slice(-5)
                              }
                            />
                          </Card>
                          <Image
                            src="/flow_animation.gif"
                            alt="flow-animation"
                            width={75}
                            height={70}
                          />
                          <Card>
                            <Statistic
                              title={
                                <Space>
                                  Receiver (Contract)
                                  <a
                                    href={`https://basescan.org/address/${stream?.receiver}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <ExportOutlined title="View on Basescan" />
                                  </a>
                                </Space>
                              }
                              value={
                                stream?.receiver?.slice(0, 5) +
                                "..." +
                                stream?.receiver?.slice(-5)
                              }
                            />
                          </Card>
                        </Space>
                        <h3 style={{ textAlign: "center" }}>
                          {calculateFlowRateInTokenPerMonth(stream?.flowRate)}{" "}
                          {supportedTokenSymbol}/month
                        </h3>
                        <Divider orientation="right" plain>
                          Last Updated:{" "}
                          {dayjs(stream?.lastUpdated * 1000).fromNow()}
                        </Divider>
                        <div style={{ textAlign: "center" }}>
                          <h3>Mint an item</h3>
                          <p>Mint a new item and unlock your super powers</p>
                          <p>
                            *You can mint an item if you have streamed atleast{" "}
                            <b>
                              0.01{" "}
                              <a
                                href={`https://basescan.org/token/${supportedTokenAddress}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {supportedTokenSymbol}
                              </a>
                            </b>{" "}
                            to contract
                          </p>
                          <p>
                            *Your Item's attributes will be dynamic based on
                            your stream
                          </p>
                          <Space.Compact style={{ width: "90%" }}>
                            <Input
                              type="text"
                              value={mintToAddress}
                              placeholder="Address to mint to"
                              onChange={(e) => setMintToAddress(e.target.value)}
                            />
                            <Button
                              type="primary"
                              title="Mint new item"
                              loading={loading.mintItem}
                              icon={<ArrowRightOutlined />}
                              onClick={handleMintItem}
                            />
                          </Space.Compact>
                        </div>
                      </>
                    ) : (
                      <Empty
                        description={
                          <>
                            <b>
                              No stream found. Open a stream to contract and
                              unlock your super powers{" "}
                            </b>
                            <p>
                              *You can mint an item if you have streamed atleast{" "}
                              <b>
                                0.01{" "}
                                <a
                                  href={`https://basescan.org/token/${supportedTokenAddress}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {supportedTokenSymbol}
                                </a>
                              </b>{" "}
                              to contract
                            </p>
                            <p>
                              *Your Item's attributes will be dynamic based on
                              your stream
                            </p>
                          </>
                        }
                      />
                    )}
                  </Card>
                </div>
              )
            },
            {
              key: "2",
              label: "Items",
              children: (
                <div>
                  <h1 style={{ textAlign: "center" }}>Items</h1>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SyncOutlined spin={dataLoading} />}
                    onClick={getItems}
                  />
                  <Row gutter={[16, 18]}>
                    {items?.length > 0 ? (
                      items.map((item) => {
                        return (
                          <Col key={item?.id} xs={20} sm={10} md={6} lg={4}>
                            <Card
                              hoverable
                              bordered
                              loading={dataLoading}
                              style={{
                                // cursor: "pointer",
                                width: "100%",
                                marginTop: 14,
                                borderRadius: 10,
                                border: "1px solid #d9d9d9"
                              }}
                              cover={
                                <img
                                  alt="item"
                                  src={item?.image}
                                  style={{
                                    marginTop: 10,
                                    width: "100%",
                                    maxHeight: "260px", // You can adjust this value
                                    objectFit: "contain",
                                    borderRadius: 10
                                  }}
                                />
                              }
                            >
                              <Card.Meta
                                title={
                                  <Space>
                                    {item?.name}
                                    <a
                                      href={`https://opensea.io/assets/base/${contractAddress}/${item?.id}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <ExportOutlined title="View on Opensea" />
                                    </a>
                                  </Space>
                                }
                                description={"SuperUnlockable"}
                              />
                              <Divider />
                              <p>Attributes</p>
                              <Statistic
                                title="Power"
                                value={item?.attributes[0]?.value}
                                suffix=" Wei"
                                groupSeparator=""
                                valueStyle={{
                                  color: "#10bb35",
                                  fontSize: "14px"
                                }}
                              />

                              <Statistic
                                title="Speed"
                                value={item?.attributes[1]?.value}
                                suffix=" Wei/Sec"
                                groupSeparator=""
                                valueStyle={{
                                  color: "#1677ff",
                                  fontSize: "14px"
                                }}
                              />
                              <Statistic
                                title="Age"
                                value={item?.attributes[2]?.value}
                                suffix=" Secs"
                                groupSeparator=""
                                valueStyle={{
                                  color: "#ff4d4f",
                                  fontSize: "14px"
                                }}
                              />
                            </Card>
                          </Col>
                        );
                      })
                    ) : (
                      <Empty description="No items found" />
                    )}
                  </Row>
                </div>
              )
            }
          ]}
        />
      )}
    </div>
  );
}
