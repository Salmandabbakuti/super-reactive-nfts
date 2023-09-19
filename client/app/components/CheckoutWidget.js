import { useMemo } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { Button, Badge } from "antd";
import SuperfluidWidget from "@superfluid-finance/widget";
import { supportedTokenAddress, contractAddress } from "@/app/utils";

const productDetails = {
  name: "SuperUnlockable",
  description:
    "Unleash your money-streaming powers with SuperUnlockable. Open a stream to contract and unlock your super powers today!",
  imageURI:
    "https://ipfs.io/ipfs/QmPDYdFGZCEKXgsVmVq4CMH9JoPCYqyBfD2ELEg53LNd5G",
  successText: "You have successfully opnen a stream to contract"
};

const paymentDetails = {
  paymentOptions: [
    {
      receiverAddress: contractAddress,
      chainId: 80001,
      superToken: {
        address: supportedTokenAddress
      }
    }
  ]
};

const themeOptions = {
  typography: {
    fontFamily: "'Noto Sans', 'sans-serif'"
  },
  palette: {
    mode: "light",
    primary: {
      main: "#1DB227"
    },
    secondary: {
      main: "#fff"
    }
  },
  shape: {
    borderRadius: 30
  },
  components: {
    MuiStepIcon: {
      styleOverrides: {
        text: {
          fill: "#fff"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 25
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25
        }
      }
    }
  }
};

export default function CheckoutWidget({ title, icon }) {
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
      theme={themeOptions}
    >
      {({ openModal }) => (
        <Badge dot status="processing">
          <Button
            type="primary"
            shape="circle"
            title={title}
            icon={icon}
            onClick={() => openModal()}
          />
        </Badge>
      )}
    </SuperfluidWidget>
  );
}
