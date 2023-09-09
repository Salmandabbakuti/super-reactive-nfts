import { formatEther, parseEther, formatUnits } from "@ethersproject/units";
import { Contract } from "@ethersproject/contracts";
import { GraphQLClient } from "graphql-request";

const contractABI = [
  "function mintItem(address _to)",
  "function setRequiredDeposit(uint256 _amount)",
  "function withdrawFunds()",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function requiredDeposit() view returns (uint256)",
  "function getFlowInfo(address _token, address _sender, address _receiver) view returns (uint256 lastUpdated, int96 flowRate, uint256 deposit, uint256 owedDeposit)",
  "function tokenURI(uint256 tokenId) view returns (string)"
];
const cfav1ForwarderABI = [
  "function createFlow(address token, address sender, address receiver, int96 flowrate, bytes userData) returns (bool)",
  "function updateFlow(address token, address sender, address receiver, int96 flowrate, bytes userData) returns (bool)",
  "function deleteFlow(address token, address sender, address receiver, bytes userData) returns (bool)"
];
const cfav1ForwarderContractAddress = process.env.NEXT_PUBLIC_CFAV1_FORWARDER_ADDRESS || "0xcfA132E353cB4E398080B9700609bb008eceB125";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x18Ce4A4D16f1DDFe9dbcf900c49e0316DC47B115";

export const contract = new Contract(contractAddress, contractABI);
export const cfav1ForwarderContract = new Contract(cfav1ForwarderContractAddress, cfav1ForwarderABI);
export const graphqlClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_SUBGRAPH_URL || "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
  { headers: {} }
);

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