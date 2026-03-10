import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const GRAPH_ENDPOINTS: Record<number, string> = {
  97: 'https://api.studio.thegraph.com/query/114657/openfi-bsc-testnet/version/latest',
  688689: 'https://api.goldsky.com/api/public/project_cm040smxin6ju01x481kh0o8l/subgraphs/openfi-atlantic/1.0.1/graphql',
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
