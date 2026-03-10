import { create } from 'zustand';
import { DEFAULT_GRAPH_URL, fetchReservesAction, getGraphUrlByChainId, type Reserve } from '@/services/graph/fetch';
import { DEFAULT_CHAINID } from '@/services/graph/client';

export interface GlobalState {
  reserves: Reserve[];
  isLoading: boolean;
  error: string | null;
  chainId: number;
  graphUrl: string;
  setChainId: (chainId: number) => void;
  setGraphUrl: (url: string) => void;
  fetchReserves: () => Promise<void>;
}

export const useGlobalState = create<GlobalState>((set, get) => ({
  reserves: [],
  isLoading: false,
  error: null,
  chainId: DEFAULT_CHAINID,
  graphUrl: DEFAULT_GRAPH_URL,
  setChainId: (chainId = DEFAULT_CHAINID) => {
    if (typeof chainId === 'number') {
      set({ chainId, graphUrl: getGraphUrlByChainId(chainId) });
      return;
    }
  },
  setGraphUrl: (url) => set({ graphUrl: url }),
  fetchReserves: () => fetchReservesAction(set, get),
}));
