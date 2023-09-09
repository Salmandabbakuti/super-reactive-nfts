import { gql } from "graphql-request";

export const GET_STREAMS = gql`
  query streams(
    $skip: Int
    $first: Int
    $orderBy: Stream_orderBy
    $orderDirection: OrderDirection
    $where: Stream_filter
  ) {
    streams(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      currentFlowRate
      sender {
        id
      }
      receiver {
        id
      }
      token {
        id
      }
      streamedUntilUpdatedAt
      createdAtTimestamp
      updatedAtTimestamp
    }
  }
`;
