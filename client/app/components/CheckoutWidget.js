import { useMemo } from "react";
import { useWeb3Modal, Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { base, baseGoerli } from "wagmi/chains";
import { Button, Badge } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import SuperfluidWidget from "@superfluid-finance/widget";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from "@web3modal/ethereum";
import { supportedTokenAddress, contractAddress } from "@/app/utils";

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

const productDetails = {
  name: "SuperUnlockable",
  description:
    "Unleash your money-streaming powers with SuperUnlockable. Open a stream to contract and unlock your super powers today!",
  imageURI: "",
  successText: "You have successfully opnen a stream to contract"
};

const paymentDetails = {
  paymentOptions: [
    {
      receiverAddress: contractAddress,
      chainId: 8453,
      superToken: {
        address: supportedTokenAddress
      }
    }
  ]
};

export default function CheckoutWidget() {
  const { open, isOpen, setDefaultChain } = useWeb3Modal();
  const walletManager = useMemo(
    () => ({
      open: ({ chain }) => {
        if (chain) {
          setDefaultChain(chain);
        }
        open();
      },
      isOpen
    }),
    [open, isOpen, setDefaultChain]
  );

  const eventListeners = useMemo(
    () => ({
      onSuccess: () => console.log("Success"),
      onSuccessButtonClick: () => console.log("onSuccessButtonClick")
    }),
    []
  );

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <SuperfluidWidget
          productDetails={productDetails}
          paymentDetails={paymentDetails}
          type="drawer"
          walletManager={walletManager}
          eventListeners={eventListeners}
        >
          {({ openModal }) => (
            <Badge dot status="processing">
              <Button
                type="primary"
                shape="circle"
                title="Create new stream"
                icon={<PlusCircleOutlined />}
                onClick={() => openModal()}
              />
            </Badge>
          )}
        </SuperfluidWidget>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
