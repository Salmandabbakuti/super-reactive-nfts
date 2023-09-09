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
  Avatar
} from "antd";
import {
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  WalletOutlined,
  WalletFilled,
  ArrowRightOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { graphqlClient as client } from "./utils";
import { GET_STREAMS } from "./utils/graphqlQueries";
import {
  calculateFlowRateInTokenPerMonth,
  calculateFlowRateInWeiPerSecond,
  cfav1ForwarderContract,
  contract
} from "./utils";
import styles from "./page.module.css";

dayjs.extend(relativeTime);
const contractAddress =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x18Ce4A4D16f1DDFe9dbcf900c49e0316DC47B115";
const supportedTokenAddress =
  process.env.NEXT_PUBLIC_SUPPORTED_TOKEN_ADDRESS ||
  "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f";

export default function Home() {
  const [dataLoading, setDataLoading] = useState(false);
  const [stream, setStream] = useState();
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [updatedFlowRateInput, setUpdatedFlowRateInput] = useState(0);
  const [loading, setLoading] = useState({ connect: false });
  const [flowRateInput, setFlowRateInput] = useState(0);

  const getStreamsToContract = async () => {
    setDataLoading(true);
    client
      .request(GET_STREAMS, {
        skip: 0,
        first: 1,
        orderBy: "updatedAtTimestamp",
        orderDirection: "desc",
        where: {
          sender: account.toLowerCase(),
          receiver: contractAddress.toLowerCase(),
          token: supportedTokenAddress.toLowerCase(),
          currentFlowRate_gt: 0
        }
      })
      .then((data) => {
        console.log("User Stream to contract: ", data.streams[0]);
        setStream(data.streams[0]);
        setDataLoading(false);
      })
      .catch((err) => {
        message.error("Something went wrong!");
        console.error("failed to get user streams to contract: ", err);
        setDataLoading(false);
      });
  };
  const handleDisconnectWallet = async () => {
    setAccount(null);
    setProvider(null);
    message.success("Wallet disconnected");
  };

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
      if (chainId !== 80001) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }]
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x13881",
                    chainName: "Polygon Mumbai",
                    nativeCurrency: {
                      name: "Matic",
                      symbol: "MATIC",
                      decimals: 18
                    },
                    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                    blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
                  }
                ]
              });
            } catch (addError) {
              console.error("Failed to add Polygon Mumbai:", addError);
              return message.error("Failed to add Polygon Mumbai");
            }
          } else {
            console.error("Failed to switch to Polygon Mumbai:", switchError);
            return message.error("Failed to switch to Polygon Mumbai");
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

  const handleCreateStreamToContract = async (flowRate) => {
    if (!account || !provider)
      return message.error("Please connect wallet first");
    if (!flowRate) return message.error("Please enter flow rate");
    try {
      setLoading(true);
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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      message.error("Failed to open stream to contract");
      console.error("failed to open stream to contract: ", err);
    }
  };

  const handleUpdateStreamToContract = async (flowRate) => {
    if (!account || !cfav1ForwarderContract)
      return message.error("Please connect wallet first");
    if (!flowRate) return message.error("Please enter new flow rate");
    try {
      setLoading(true);
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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      message.error("Failed to update stream");
      console.error("failed to update stream: ", err);
    }
  };

  const handleDeleteStream = async () => {
    if (!account || !cfav1ForwarderContract)
      return message.error("Please connect wallet first");
    if (!stream) return message.error("No stream found open to contract");
    try {
      setLoading(true);
      const signer = provider.getSigner();
      const tx = await cfav1ForwarderContract
        .connect(signer)
        .deleteFlow(supportedTokenAddress, account, contractAddress, "0x");
      await tx.wait();
      message.success("Stream deleted successfully");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      message.error("Failed to delete stream");
      console.error("failed to delete stream: ", err);
    }
  };

  const handleMintItem = async () => { };

  useEffect(() => {
    if (account) getStreamsToContract();
  }, [account]);

  return (
    <div>
      <div className={styles.cardContainer}>
        {account ? (
          <>
            <Button
              icon={<WalletOutlined />}
              type="default"
              onClick={handleDisconnectWallet}
            >
              {account.slice(0, 8) + "..." + account.slice(-5)}
            </Button>
            {stream ? (
              <Card
                title="Your Stream to contract"
                bordered
                hoverable
                loading={dataLoading}
                style={{ width: 450 }}
                actions={[
                  <p>
                    Created At:{" "}
                    {dayjs(stream?.createdAtTimestamp * 1000).fromNow()}
                  </p>,
                  <p>
                    Updated At:{" "}
                    {dayjs(stream?.updatedAtTimestamp * 1000).fromNow()}
                  </p>
                ]}
                extra={
                  <Space>
                    <Button
                      title="Refresh"
                      type="primary"
                      shape="circle"
                      icon={<SyncOutlined spin={dataLoading} />}
                      onClick={getStreamsToContract}
                    />
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
                            <b>{updatedFlowRateInput || 0} fDAIx/month</b> to
                            contract
                          </p>
                        </>
                      }
                      onConfirm={() =>
                        handleUpdateStreamToContract(updatedFlowRateInput)
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
                  </Space>
                }
              >
                <h3 style={{ textAlign: "center" }}>
                  {calculateFlowRateInTokenPerMonth(stream?.currentFlowRate)}{" "}
                  fDAIx/mo
                </h3>
                <Space>
                  <Card style={{ float: "left" }}>
                    <Statistic
                      title="Sender (You)"
                      value={
                        stream?.sender?.id.slice(0, 5) +
                        "..." +
                        stream?.sender?.id.slice(-5)
                      }
                      precision={2}
                      valueStyle={{ color: "#3f8600", fontSize: "1rem" }}
                    // prefix={<ArrowUpOutlined />}
                    />
                  </Card>
                  <Image src="/flow_animation.gif" width={80} height={70} />
                  <Card style={{ float: "right" }}>
                    <Statistic
                      title="Receiver (Contract)"
                      value={
                        stream?.receiver?.id.slice(0, 8) +
                        "..." +
                        stream?.receiver?.id.slice(-5)
                      }
                      precision={2}
                      valueStyle={{ color: "#cf1322", fontSize: "1rem" }}
                    // prefix={<ArrowDownOutlined />}
                    // suffix="%"
                    />
                  </Card>
                </Space>
              </Card>
            ) : (
              <Card
                title="Your Stream to contract"
                // style={{ width: 500 }}
                extra={
                  <Space>
                    <Button
                      title="Refresh"
                      type="primary"
                      shape="circle"
                      icon={<SyncOutlined spin={dataLoading} />}
                      onClick={getStreamsToContract}
                    />
                    <Popconfirm
                      title={
                        <>
                          <h3>Enter flow rate</h3>
                          <Input
                            type="number"
                            placeholder="Flowrate in no. of tokens"
                            addonAfter="/month"
                            value={flowRateInput}
                            onChange={(e) => setFlowRateInput(e.target.value)}
                          />
                          <p>
                            *You are Streaming{" "}
                            <b>{flowRateInput || 0} fDAIx/month</b> to contract
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
                  </Space>
                }
              >
                <p>
                  No stream found. Open a stream to contract and unlock your
                  super powers
                </p>
              </Card>
            )}
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
      {/* <Space>
        <Input.Search
          placeholder="Search by address, token or transaction hash"
          value={searchInput}
          enterButton
          allowClear
          loading={dataLoading}
          onSearch={getStreamsToContract}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="primary" onClick={getStreamsToContract}>
          <SyncOutlined />
        </Button>
      </Space> */}
    </div>
  );
}
