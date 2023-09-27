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

export const contractAddress = "0x48A822ef187a82C3bd4c8218C9bE5DC7802d77c3";
export const supportedTokenAddress = "0x5d8b4c2554aeb7e86f387b4d6c00ac33499ed01f";
export const supportedTokenSymbol = "fDAIx";
export const explorerURL = "https://mumbai.polygonscan.com";
export const openseaURL = "https://testnets.opensea.io/assets/mumbai";

export const contract = new Contract(contractAddress, contractABI);

export const calculateFlowRateInTokenPerMonth = (amount) => {
  if (isNaN(amount)) return 0;
  // convert from wei/sec to token/month for displaying in UI
  // 2628000 = 1 month in seconds(sf recommendation)
  const flowRate = Math.round(formatEther(amount) * 2628000);
  return flowRate;
};

export const calculateFlowRateInWeiPerSecond = (amount) => {
  // convert amount from token/month to wei/second for sending to superfluid
  const flowRateInWeiPerSecond = parseEther(amount.toString())
    .div(2628000)
    .toString();
  return flowRateInWeiPerSecond;
};

export const calculateTotalStreamedSinceLastUpdate = (flowRate, lastUpdated) => {
  const timeElapsed = Date.now() / 1000 - lastUpdated;
  const totalStreamedInToken = (formatEther(flowRate) * timeElapsed).toFixed(9);
  return totalStreamedInToken;
};  