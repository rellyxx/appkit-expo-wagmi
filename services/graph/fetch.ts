import { gql } from '@apollo/client';
import { formatUnits } from 'viem';
import { createGraphClient, DEFAULT_CHAINID, GRAPH_ENDPOINTS } from '@/services/graph/client';
import type { StoreApi } from 'zustand';
import type { GlobalState } from '@/store/useGlobalState';


export interface Reserve {
  id: string;
  decimals: string;
  symbol: string;
  name: string;
  underlyingAsset: string;
  totalLiquidity: string;
  availableLiquidity: string;
  utilizationRate: string;
  totalSupplies: string;
  supplyCap: string;
  borrowCap: string;
  baseLTVasCollateral: string;
  reserveLiquidationThreshold: string;
  reserveLiquidationBonus: string;
  totalPrincipalStableDebt: string;
  totalCurrentVariableDebt: string;
  reserveFactor: string;
  liquidityRate: string;
  usageAsCollateralEnabled: boolean;
  reserveInterestRateStrategy: string;
  isDropped: boolean;
  stableBorrowRate: string;
  variableBorrowRate: string;
  totalBTokenSupply: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  optimalUtilisationRate: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  baseVariableBorrowRate: string;
  bToken: {
    id: string;
  };
  price: {
    priceInEth: string;
  }
}

interface ReserveHistoryEntry {
  timestamp: string;
  liquidityRate: string;
  stableBorrowRate: string;
  variableBorrowRate: string;
}

interface ReserveWithHistory {
  symbol: string;
  paramsHistory: ReserveHistoryEntry[];
}

export interface ReserveAprPoint {
  supplyApr: number;
  borrowApr: number;
  timestamp: number;
  date: string;
}

const RESERVES_QUERY = gql`
  query MyQuery {
    reserves {
      id
      decimals
      symbol
      name
      underlyingAsset
      totalLiquidity
      availableLiquidity
      utilizationRate
      totalSupplies
      baseLTVasCollateral
      reserveLiquidationThreshold
      reserveLiquidationBonus
      totalPrincipalStableDebt
      totalCurrentVariableDebt
      reserveFactor
      liquidityRate
      variableBorrowRate
      supplyCap
      borrowCap
      stableBorrowRate
      usageAsCollateralEnabled
      reserveInterestRateStrategy
      isDropped
      totalBTokenSupply
              utilizationRate
              variableRateSlope1
              variableRateSlope2
              optimalUtilisationRate
              stableRateSlope1
              stableRateSlope2
              baseVariableBorrowRate
      bToken {
        id
      }
      price {
        priceInEth
      }
    }
  }
`;

const RESERVES_HISTORY_QUERY = gql`
  query MyQuery($skip: Int!, $limit: Int!, $symbol: String!, $startTimestamp: Int!) {
    reserves(where: { symbol: $symbol }) {
      symbol
      paramsHistory(
        orderBy: timestamp
        orderDirection: desc
        first: $limit
        skip: $skip
        where: { timestamp_gte: $startTimestamp }
      ) {
        timestamp
        liquidityRate
        stableBorrowRate
        variableBorrowRate
      }
    }
  }
`;


export const DEFAULT_GRAPH_URL = GRAPH_ENDPOINTS[DEFAULT_CHAINID];

export function getGraphUrlByChainId(chainId: number) {
  return GRAPH_ENDPOINTS[chainId] ?? DEFAULT_GRAPH_URL;
}

export async function fetchReservesAction(
  set: StoreApi<GlobalState>['setState'],
  get: StoreApi<GlobalState>['getState'],
) {
  set({
    isLoading: true,
    error: null,
  });
  const chainId = get().chainId;
  console.log({chainId});
  
  const graphUrl = getGraphUrlByChainId(chainId);
  try {
    const client = createGraphClient(graphUrl);
    const reserves = await client.query<{ reserves: Reserve[] }>({
      query: RESERVES_QUERY,
      fetchPolicy: 'no-cache',
    });
    set({ reserves: reserves.data?.reserves ?? [], isLoading: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    set({ reserves: [], isLoading: false, error: message });
  }
}

export async function fetchReserveAprHistory(options: {
  chainId: number;
  symbol: string;
  startTimestamp?: number;
  limit?: number;
}) {
  const { chainId, symbol, startTimestamp, limit = 1000 } = options;
  const graphUrl = getGraphUrlByChainId(chainId);
  const client = createGraphClient(graphUrl);
  const oneYearAgo = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60;
  const start = startTimestamp ?? oneYearAgo;
  let skip = 0;
  const history: ReserveHistoryEntry[] = [];

  while (true) {
    const result = await client.query<{ reserves: ReserveWithHistory[] }>({
      query: RESERVES_HISTORY_QUERY,
      variables: { skip, limit, symbol, startTimestamp: start },
      fetchPolicy: 'no-cache',
    });

    const reserve = result.data?.reserves?.[0];
    const batch = reserve?.paramsHistory ?? [];
    history.push(...batch);

    if (batch.length < limit) {
      break;
    }
    skip += limit;
  }

  return history
    .map((item) => {
      const supplyApr = Number(formatUnits(BigInt(item.liquidityRate), 27)) * 100;
      const borrowApr = Number(formatUnits(BigInt(item.variableBorrowRate), 27)) * 100;
      const timestamp = Number(item.timestamp);
      return {
        supplyApr,
        borrowApr,
        timestamp,
        date: new Date(timestamp * 1000).toISOString(),
      };
    })
    .reverse();
}
