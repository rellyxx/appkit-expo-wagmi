import '@walletconnect/react-native-compat';
import React from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';
import { themeColor } from '@/constants/Colors';
import { useGlobalState } from '@/store/useGlobalState';
import { useAccount, useReadContracts } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { BorrowTab } from './BorrowTab';
import { SupplyTab } from './SupplyTab';

type SortDirection = 'asc' | 'desc';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const swipeHandledRef = React.useRef(false);
  const reserves = useGlobalState((state) => state.reserves);
  const { address, chainId } = useAccount();

  const tokenColors: Record<string, string> = {
    USDC: '#3B82F6',
    USDT: '#14B8A6',
    WETH: '#A855F7',
    ETH: '#A855F7',
    BNB: '#F59E0B',
    BTC: '#F97316',
    WBTC: '#F97316',
  };

  const tokenIcons: Record<string, string> = {
    USDC: '$',
    USDT: '$',
    WETH: 'Ξ',
    ETH: 'Ξ',
    BNB: '◎',
    BTC: '₿',
    WBTC: '₿',
  };

  const activeReserves = React.useMemo(
    () => reserves.filter((reserve) => !reserve.isDropped),
    [reserves],
  );

  const balanceContracts = React.useMemo(
    () =>
      address
        ? activeReserves.map((reserve) => ({
            address: reserve.underlyingAsset as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf' as const,
            args: [address] as const,
            chainId,
          }))
        : [],
    [activeReserves, address, chainId],
  );

  const { data: balanceResults } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled: balanceContracts.length > 0 },
  });

  const supplyBalanceContracts = React.useMemo(
    () =>
      address
        ? activeReserves.map((reserve) => ({
            address: reserve.bToken.id as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf' as const,
            args: [address] as const,
            chainId,
          }))
        : [],
    [activeReserves, address, chainId],
  );

  const { data: supplyBalanceResults } = useReadContracts({
    contracts: supplyBalanceContracts,
    query: { enabled: supplyBalanceContracts.length > 0 },
  });

  const balancesBySymbol = React.useMemo(() => {
    const map = new Map<string, string>();
    activeReserves.forEach((reserve, index) => {
      const result = balanceResults?.[index];
      if (result?.status === 'success' && typeof result.result === 'bigint') {
        const decimals = Number(reserve.decimals ?? 18);
        const formatted = formatUnits(result.result, decimals);
        map.set(reserve.symbol, formatted);
      }
    });
    return map;
  }, [activeReserves, balanceResults]);

  const [apySortDirection, setApySortDirection] = React.useState<SortDirection>('desc');
  const [depositApySortDirection, setDepositApySortDirection] = React.useState<SortDirection>('desc');

  const availableToDeposit = activeReserves.map((reserve) => {
    const balance = balancesBySymbol.get(reserve.symbol);
    return {
      liquidityRate: reserve.liquidityRate?.toString() ?? '0',
      symbol: reserve.symbol,
      name: reserve.name,
      amount: balance ? `${balance} ${reserve.symbol}` : `0 ${reserve.symbol}`,
      color: tokenColors[reserve.symbol] ?? themeColor,
      icon: tokenIcons[reserve.symbol] ?? reserve.symbol.slice(0, 1),
    };
  });

  const getLiquidityRate = (value: unknown) => {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(Math.floor(value));
    if (typeof value === 'string' && value.length > 0) return BigInt(value);
    return 0n;
  };

  const sortedAvailableToDeposit = React.useMemo(() => {
    const items = [...availableToDeposit];
    items.sort((a, b) => {
      const aRate = getLiquidityRate(a.liquidityRate);
      const bRate = getLiquidityRate(b.liquidityRate);
      if (aRate === bRate) return 0;
      if (apySortDirection === 'asc') {
        return aRate < bRate ? -1 : 1;
      }
      return aRate > bRate ? -1 : 1;
    });
    return items;
  }, [availableToDeposit, apySortDirection]);

  const deposits = activeReserves
    .map((reserve, index) => {
      const result = supplyBalanceResults?.[index];
      if (result?.status !== 'success' || typeof result.result !== 'bigint' || result.result <= 0n) {
        return null;
      }
      const decimals = Number(reserve.decimals ?? 18);
      const tokenAmount = formatUnits(result.result, decimals);
      const parsedAmount = Number(tokenAmount);
      const displayAmount = Number.isFinite(parsedAmount)
        ? parsedAmount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: parsedAmount >= 1 ? 4 : 8,
          })
        : tokenAmount;
      const supplyApy = Number(formatUnits(BigInt(reserve.liquidityRate ?? '0'), 27)) * 100;
      return {
        symbol: reserve.symbol,
        amount: `${displayAmount} ${reserve.symbol}`,
        apy: `${supplyApy.toFixed(2)}%`,
        apyValue: supplyApy,
        color: tokenColors[reserve.symbol] ?? themeColor,
        icon: tokenIcons[reserve.symbol] ?? reserve.symbol.slice(0, 1),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const sortedDeposits = React.useMemo(() => {
    const items = [...deposits];
    items.sort((a, b) => {
      if (a.apyValue === b.apyValue) return 0;
      if (depositApySortDirection === 'asc') {
        return a.apyValue < b.apyValue ? -1 : 1;
      }
      return a.apyValue > b.apyValue ? -1 : 1;
    });
    return items;
  }, [deposits, depositApySortDirection]);

  const borrows = [
    {
      symbol: 'USDT',
      amount: '150.00 USDT',
      apr: '6.1%',
      value: '$150.00',
      color: '#F97316',
      icon: '$',
    },
    {
      symbol: 'WBTC',
      amount: '0.08 WBTC',
      apr: '5.4%',
      value: '$520.00',
      color: '#F59E0B',
      icon: '₿',
    },
  ];

  const availableToBorrow = [
    {
      symbol: 'USDC',
      amount: 'Borrow limit: 2,400.00 USDC',
      color: '#3B82F6',
      icon: '$',
    },
    {
      symbol: 'WETH',
      amount: 'Borrow limit: 0.90 WETH',
      color: '#A855F7',
      icon: 'Ξ',
    },
  ];

  const pageWidth = contentWidth || Math.max(windowWidth - 40, 0);

  const handleTabPress = React.useCallback((index: number) => {
    setActiveTab(index);
    if (pageWidth > 0) {
      scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    }
  }, [pageWidth]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 && Math.abs(gesture.dy) < 6,
        onPanResponderMove: (_, gesture) => {
          if (swipeHandledRef.current) return;
          if (gesture.dx > 6 && activeTab !== 0) {
            swipeHandledRef.current = true;
            handleTabPress(0);
          }
          if (gesture.dx < -6 && activeTab !== 1) {
            swipeHandledRef.current = true;
            handleTabPress(1);
          }
        },
        onPanResponderRelease: () => {
          swipeHandledRef.current = false;
        },
        onPanResponderTerminate: () => {
          swipeHandledRef.current = false;
        },
      }),
    [activeTab, handleTabPress],
  );

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <DashboardHeader title="Dashboard" />
      <ScrollView
        contentContainerClassName="px-5 pb-28 gap-4"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >

        <View className="rounded-[20px] p-5 gap-2 shadow-lg" style={{ backgroundColor: themeColor }}>
          <Text className="text-sm font-semibold text-[#D6E4FF]">Net Worth</Text>
          <View className="self-start rounded-full bg-white/20 px-2.5 py-1.5">
            <Text className="text-xs font-semibold text-white">↗  +2.4% vs last week</Text>
          </View>
        </View>

        <View className="flex-row border-b border-[#E5E7EB]">
          <Pressable
            className="flex-1 items-center py-3 border-b-2"
            style={{ borderBottomColor: activeTab === 0 ? themeColor : 'transparent' }}
            onPress={() => handleTabPress(0)}
          >
            <Text
              className={`text-sm ${activeTab === 0 ? 'font-bold' : 'font-semibold text-[#6B7280]'}`}
              style={activeTab === 0 ? { color: themeColor } : undefined}
            >
              Supply
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 items-center py-3 border-b-2"
            style={{ borderBottomColor: activeTab === 1 ? themeColor : 'transparent' }}
            onPress={() => handleTabPress(1)}
          >
            <Text
              className={`text-sm ${activeTab === 1 ? 'font-bold' : 'font-semibold text-[#6B7280]'}`}
              style={activeTab === 1 ? { color: themeColor } : undefined}
            >
              Borrow
            </Text>
          </Pressable>
        </View>

        <View
          onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
          className="mt-1"
          {...panResponder.panHandlers}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ width: pageWidth * 2 }}
          >
            <View style={{ width: pageWidth }}>
              <SupplyTab
                sortedDeposits={sortedDeposits}
                sortedAvailableToDeposit={sortedAvailableToDeposit}
                onToggleDepositApySort={() =>
                  setDepositApySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                }
                onToggleSupplyApySort={() => setApySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                themeColor={themeColor}
              />
            </View>

            <View style={{ width: pageWidth }}>
              <BorrowTab borrows={borrows} availableToBorrow={availableToBorrow} themeColor={themeColor} />
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
