import { useMemo } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { Button, Badge } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import SuperfluidWidget from "@superfluid-finance/widget";
import { supportedTokenAddress, contractAddress } from "@/app/utils";

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
  );
}
