import { create } from 'zustand';
import { DEFAULT_GRAPH_URL, fetchReservesAction, getGraphUrlByChainId, type Reserve } from '@/services/graph/fetch';

export interface GlobalState {
  reserves: Reserve[];
  isLoading: boolean;
  error: string | null;
  chainId: number;
  graphUrl: string;
  setChainId: (chainId: number) => void;
  setGraphUrl: (url: string) => void;
  fetchReserves: (chainId?: number) => Promise<void>;
}

export const useGlobalState = create<GlobalState>((set, get) => ({
  reserves: [],
  isLoading: false,
  error: null,
  chainId: 97,
  graphUrl: DEFAULT_GRAPH_URL,
  setChainId: (chainId = 97) => {
    if (typeof chainId === 'number') {
      set({ chainId, graphUrl: getGraphUrlByChainId(chainId) });
      return;
    }
  },
  setGraphUrl: (url) => set({ graphUrl: url }),
  fetchReserves: () => fetchReservesAction(set, get),
}));
