import "@walletconnect/react-native-compat";
import 'text-encoding';
import '../global.css';
import {
  AppKit,
  AppKitProvider,
  bitcoin,
  createAppKit,
  solana,
} from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { SolanaAdapter, PhantomConnector, SolflareConnector } from "@reown/appkit-solana-react-native";
import { BitcoinAdapter } from "@reown/appkit-bitcoin-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arbitrum, mainnet, polygon, bsc, base, bscTestnet } from "@wagmi/core/chains";
import { WagmiProvider } from "wagmi";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as SystemUI from 'expo-system-ui';

import { useColorScheme } from '@/hooks/useColorScheme';
import { themeColor } from '@/constants/Colors';
import { storage } from "@/utils/StorageUtil";
import { View } from 'react-native';
import { useEffect } from 'react';

const clipboardClient = {
  setString: async (value: string) => {
    Clipboard.setStringAsync(value);
  },
};

// 0. Setup queryClient
const queryClient = new QueryClient();

const projectId =
  process.env.EXPO_PUBLIC_REOWN_PROJECT_ID ??
  Constants.expoConfig?.extra?.reownProjectId ??
  "b8e39dfb697ba26ac5a77a4b29b35604";



// 2. Create config
const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "appkitexpowagmi://",
    universal: "https://reown.com/appkit",
  },
};

const pharosAtlanticTestnet = {
  id: 688689,
  name: "Pharos Atlantic Testnet",
  network: "Pharos Atlantic Testnet",
  nativeCurrency: {
    name: "PHRS",
    symbol: "PHRS",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://atlantic.dplabs-internal.com"],
    },
    public: {
      http: ["https://atlantic.dplabs-internal.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Pharos Atlantic Testnet",
      url: "https://atlantic.pharosscan.xyz/",
    },
  },
} as const;

const networks = [mainnet, polygon, arbitrum, bsc, base, bscTestnet, pharosAtlanticTestnet];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: networks as any,
});

const solanaAdapter = new SolanaAdapter();
const bitcoinAdapter = new BitcoinAdapter();

// 3. Create modal
const appkit = createAppKit({
  projectId,
  networks: [...networks, solana, bitcoin],
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
  extraConnectors: [new PhantomConnector({ cluster: 'mainnet-beta' }), new SolflareConnector({ cluster: 'mainnet-beta' })],
  metadata,
  clipboardClient,
  storage,
  defaultNetwork: pharosAtlanticTestnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  themeVariables: {
    accent: themeColor,
  },
  features: {
    socials: false,
    onramp: false
  }
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    KHTeka: require('../assets/fonts/KHTeka-Regular.otf'),
    KHTekaMedium: require('../assets/fonts/KHTeka-Medium.otf'),
    KHTekaMono: require('../assets/fonts/KHTekaMono-Regular.otf'),
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#F4F6FB');
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider instance={appkit}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" backgroundColor="#F4F6FB" translucent={false} />
          {/* This is a workaround for the Android modal issue. https://github.com/expo/expo/issues/32991#issuecomment-2489620459 */}
          <View style={{ position: "absolute", height: "100%", width: "100%" }}>
            <AppKit />
          </View>
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
