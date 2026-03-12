import { create } from 'zustand';
import { DEFAULT_GRAPH_URL, fetchReservesAction, getGraphUrlByChainId, type Reserve } from '@/services/graph/fetch';
import { DEFAULT_CHAINID } from '@/services/graph/client';

export interface GlobalState {
  reserves: Reserve[];
  isLoading: boolean;
  error: string | null;
  chainId: number;
  graphUrl: string;
  healthFactor: string;
  totalCollateralBase: string;
  totalDebtBase: string;
  currentLiquidationThreshold: string;
  userAccountData: bigint[];
  setChainId: (chainId: number) => void;
  setGraphUrl: (url: string) => void;
  setHealthFactor: (value: string) => void;
  setUserAccountData: (payload: {
    totalCollateralBase: string;
    totalDebtBase: string;
    currentLiquidationThreshold: string;
    userAccountData: bigint[];
  }) => void;
  fetchReserves: () => Promise<void>;
}

export const useGlobalState = create<GlobalState>((set, get) => ({
  reserves: [],
  isLoading: false,
  error: null,
  chainId: DEFAULT_CHAINID,
  graphUrl: DEFAULT_GRAPH_URL,
  healthFactor: '0.00',
  totalCollateralBase: '0',
  totalDebtBase: '0',
  currentLiquidationThreshold: '0',
  userAccountData: [],
  setChainId: (chainId = DEFAULT_CHAINID) => {
    if (typeof chainId === 'number') {
      set({ chainId, graphUrl: getGraphUrlByChainId(chainId) });
      return;
    }
  },
  setGraphUrl: (url) => set({ graphUrl: url }),
  setHealthFactor: (value) => set({ healthFactor: value }),
  setUserAccountData: (payload) => set(payload),
  fetchReserves: () => fetchReservesAction(set, get),
}));
