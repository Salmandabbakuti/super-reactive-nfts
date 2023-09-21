import { formatEther, parseEther } from "@ethersproject/units";
import { Contract } from "@ethersproject/contracts";

const contractABI = [
  "function mintItem(address _to)",
  "function setRequiredDeposit(uint256 _amount)",
  "function withdrawFunds()",
  "function currentTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function requiredDeposit() view returns (uint256)",
  "function deleteFlowToContract() returns (bool)",
  "function getFlowInfo(address _token, address _sender, address _receiver) view returns (uint256 lastUpdated, int96 flowRate, uint256 deposit, uint256 owedDeposit)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];

export const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xF48be574c4F32430324067817B1FF49FC3ea9618";
export const supportedTokenAddress =
  process.env.NEXT_PUBLIC_SUPPORTED_TOKEN_ADDRESS ||
  "0x4dB26C973FaE52f43Bd96A8776C2bf1b0DC29556";

export const supportedTokenSymbol =
  process.env.NEXT_PUBLIC_SUPPORTED_TOKEN_SYMBOL || "USDbCx";

export const contract = new Contract(contractAddress, contractABI);

export const calculateFlowRateInTokenPerMonth = (amount) => {
  if (isNaN(amount)) return 0;
  // convert from wei/sec to token/month for displaying in UI
  const flowRate = (formatEther(amount) * 2592000).toFixed(9);
  // if flowRate is floating point number, remove unncessary trailing zeros
  return flowRate.replace(/\.?0+$/, "");
};

export const calculateFlowRateInWeiPerSecond = (amount) => {
  // convert amount from token/month to wei/second for sending to superfluid
  const flowRateInWeiPerSecond = parseEther(amount.toString())
    .div(2592000)
    .toString();
  return flowRateInWeiPerSecond;
};

export const calculateTotalStreamedSinceLastUpdate = (flowRate, lastUpdated) => {
  const timeElapsed = Date.now() / 1000 - lastUpdated;
  const totalStreamedInToken = (formatEther(flowRate) * timeElapsed).toFixed(9);
  return totalStreamedInToken;
};  