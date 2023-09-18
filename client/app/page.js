"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
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
  PlusCircleOutlined,
  WalletOutlined,
  WalletFilled,
  ArrowRightOutlined,
  ExportOutlined
} from "@ant-design/icons";

import {
  calculateFlowRateInTokenPerMonth,
  calculateFlowRateInWeiPerSecond,
  calculateTotalStreamedSinceLastUpdate,
  cfav1ForwarderContract,
  contract
} from "./utils";
import styles from "./page.module.css";

dayjs.extend(relativeTime);
const contractAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0xdAF74831881645Fd64Cab0673f4B8b79c36d232d";
const supportedTokenAddress =
  process.env.NEXT_PUBLIC_SUPPORTED_TOKEN_ADDRESS ||
  "0x4dB26C973FaE52f43Bd96A8776C2bf1b0DC29556";

export default function Home() {
  const [dataLoading, setDataLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [updatedFlowRateInput, setUpdatedFlowRateInput] = useState(0);
  const [loading, setLoading] = useState({ connect: false });
  const [flowRateInput, setFlowRateInput] = useState(0);
  const [items, setItems] = useState([]);
  const [mintToAddress, setMintToAddress] = useState("");
  const [
    amountStreamedSinceLastUpdate,
    setAmountStreamedSinceLastUpdate
  ] = useState(0);

  const handleConnectWallet = async () => {
    if (!window?.ethereum) {
      return message.error(
        "Please install Metamask or any other web3 enabled browser"
      );
    }
    setLoading({ connect: true });
    try {
      const currentProvider = new Web3Provider(window.ethereum);
      const { chainId } = await currentProvider.getNetwork();
      if (chainId !== 8453) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x2105",
                    chainName: "Base Mainnet",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18
                    },
                    rpcUrls: [
                      "https://mainnet.base.org",
                      "https://base.meowrpc.com"
                    ],
                    blockExplorerUrls: ["https://basescan.org"]
                  }
                ]
              });
            } catch (addError) {
              console.error("Failed to add Base Mainnet:", addError);
              return message.error("Failed to add Base Mainnet");
            }
          } else {
            console.error("Failed to switch to Base Mainnet:", switchError);
            return message.error("Failed to switch to Base Mainnet");
          }
        }
      }
      const [account1] = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Using account: ", account1);
      console.log("current chainId:", chainId);
      const provider = new Web3Provider(window.ethereum);
      setAccount(account1);
      setProvider(provider);
      message.success("Wallet connected");
    } catch (err) {
      console.log("err connecting wallet", err);
      message.error("Failed to connect wallet!");
    } finally {
      setLoading({ connect: false });
    }
  };

  const handleDisconnectWallet = async () => {
    setAccount(null);
    setStream(null);
    setProvider(null);
    message.success("Wallet disconnected");
  };

  const handleCreateStreamToContract = async (flowRate) => {
    if (!account || !provider)
      return message.error("Please connect wallet first");
    if (!flowRate) return message.error("Please enter flow rate");
    try {
      const flowRateInWeiPerSecond = calculateFlowRateInWeiPerSecond(flowRate);
      console.log("flowRateInWeiPerSecond: ", flowRateInWeiPerSecond);
      const signer = provider.getSigner();
      const tx = await cfav1ForwarderContract
        .connect(signer)
        .createFlow(
          supportedTokenAddress,
          account,
          contractAddress,
          flowRateInWeiPerSecond,
          "0x"
        );
      await tx.wait();
      message.success("Stream opened to contract successfully");
    } catch (err) {
      message.error("Failed to open stream to contract");
      console.error("failed to open stream to contract: ", err);
    }
  };

  const handleUpdateStreamToContract = async (flowRate) => {
    if (!account || !cfav1ForwarderContract)
      return message.error("Please connect wallet first");
    if (!flowRate) return message.error("Please enter new flow rate");
    try {
      const flowRateInWeiPerSecond = calculateFlowRateInWeiPerSecond(flowRate);
      console.log("flowRateInWeiPerSecond: ", flowRateInWeiPerSecond);
      const signer = provider.getSigner();
      const tx = await cfav1ForwarderContract
        .connect(signer)
        .updateFlow(
          supportedTokenAddress,
          account,
          contractAddress,
          flowRateInWeiPerSecond,
          "0x"
        );
      await tx.wait();
      message.success("Stream updated successfully");
    } catch (err) {
      message.error("Failed to update stream");
      console.error("failed to update stream: ", err);
    }
  };

  const handleDeleteStream = async () => {
    if (!account || !cfav1ForwarderContract)
      return message.error("Please connect wallet first");
    if (!stream) return message.error("No stream found open to contract");
    try {
      const signer = provider.getSigner();
      const tx = await cfav1ForwarderContract
        .connect(signer)
        .deleteFlow(supportedTokenAddress, account, contractAddress, "0x");
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
      const { lastUpdated, flowRate } = await cfav1ForwarderContract
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
      getStreamToContract();
      getItems();
    }
  }, [account]);

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
      {account ? (
        <>
          <Button
            icon={<WalletOutlined />}
            type="default"
            onClick={handleDisconnectWallet}
          >
            {account.slice(0, 8) + "..." + account.slice(-5)}
          </Button>
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
                            type="primary"
                            shape="circle"
                            icon={<SyncOutlined spin={dataLoading} />}
                            onClick={getStreamToContract}
                          />
                          {stream ? (
                            <>
                              <Popconfirm
                                title={
                                  <>
                                    <h3>Enter new flow rate</h3>
                                    <Input
                                      type="number"
                                      placeholder="Flowrate in no. of tokens"
                                      addonAfter="/month"
                                      value={updatedFlowRateInput}
                                      onChange={(e) =>
                                        setUpdatedFlowRateInput(e.target.value)
                                      }
                                    />
                                    <p>
                                      *You are Streaming{" "}
                                      <b>
                                        {updatedFlowRateInput || 0} USDbCx/month
                                      </b>{" "}
                                      to{" "}
                                      <a
                                        href={`https://basescan.org/address/${supportedTokenAddress}`}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Contract
                                      </a>
                                    </p>
                                  </>
                                }
                                onConfirm={() =>
                                  handleUpdateStreamToContract(
                                    updatedFlowRateInput
                                  )
                                }
                              >
                                <Button
                                  title="Update"
                                  icon={<EditOutlined />}
                                  type="primary"
                                  shape="circle"
                                />
                              </Popconfirm>
                              <Popconfirm
                                title="Are you sure to delete?"
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
                            <Popconfirm
                              title={
                                <>
                                  <h3>Enter flow rate</h3>
                                  <Input
                                    type="number"
                                    placeholder="Flowrate in no. of tokens"
                                    addonAfter="/month"
                                    value={flowRateInput}
                                    onChange={(e) =>
                                      setFlowRateInput(e.target.value)
                                    }
                                  />
                                  <p>
                                    *You are Streaming{" "}
                                    <b>{flowRateInput || 0} USDbCx/month</b> to{" "}
                                    <a
                                      href={`https://basescan.org/address/${supportedTokenAddress}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Contract
                                    </a>
                                  </p>
                                </>
                              }
                              onConfirm={() =>
                                handleCreateStreamToContract(flowRateInput)
                              }
                            >
                              <Button
                                type="primary"
                                shape="circle"
                                title="Create new stream"
                                icon={<PlusCircleOutlined />}
                              />
                            </Popconfirm>
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
                              value={`${amountStreamedSinceLastUpdate} USDbCx`}
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
                            USDbCx/month
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
                                  USDbCx
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
                                onChange={(e) =>
                                  setMintToAddress(e.target.value)
                                }
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
                                *You can mint an item if you have streamed
                                atleast{" "}
                                <b>
                                  0.01{" "}
                                  <a
                                    href={`https://basescan.org/token/${supportedTokenAddress}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    USDbCx
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
                                    fontSize: "1rem"
                                  }}
                                />

                                <Statistic
                                  title="Speed"
                                  value={item?.attributes[1]?.value}
                                  suffix=" Wei/Sec"
                                  groupSeparator=""
                                  valueStyle={{
                                    color: "#1677ff",
                                    fontSize: "1rem"
                                  }}
                                />
                                <Statistic
                                  title="Age"
                                  value={item?.attributes[2]?.value}
                                  suffix=" Secs"
                                  groupSeparator=""
                                  valueStyle={{
                                    color: "#ff4d4f",
                                    fontSize: "1rem"
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
        </>
      ) : (
        <Button
          type="primary"
          icon={<WalletFilled />}
          loading={loading.connect}
          onClick={handleConnectWallet}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
