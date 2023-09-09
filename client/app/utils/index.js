import { formatEther, parseEther } from "@ethersproject/units";
import { GraphQLClient } from "graphql-request";

export const graphqlClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai",
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