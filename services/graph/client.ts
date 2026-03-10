import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const GRAPH_ENDPOINTS: Record<number, string> = {
  97: 'https://api.studio.thegraph.com/query/114657/openfi-bsc-testnet/version/latest',
};


export function createGraphClient(uri: string) {
  return new ApolloClient({
    link: new HttpLink({
      uri,
      fetch: globalThis.fetch,
    }),
    cache: new InMemoryCache(),
  });
}
