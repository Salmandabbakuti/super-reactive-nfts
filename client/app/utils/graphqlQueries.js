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
      sender
      receiver
      token
      flowRate
      txHash
      createdAt
      updatedAt
    }
  }
`;

export const GET_TOKENS = gql`
  query tokens(
    $skip: Int
    $first: Int
    $orderBy: Token_orderBy
    $orderDirection: OrderDirection
    $where: Token_filter
  ) {
    tokens(
      skip: $skip
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      owner
      uri
      createdAt
    }
  }
`;
