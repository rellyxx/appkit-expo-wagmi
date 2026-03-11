import '@walletconnect/react-native-compat';
import React from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';
import { themeColor } from '@/constants/Colors';
import { useGlobalState } from '@/store/useGlobalState';
import { useAccount, useReadContracts } from 'wagmi';
import { erc20Abi, formatUnits, type Abi } from 'viem';
import BigNumberJs from 'bignumber.js';
import { BorrowTab } from './BorrowTab';
import { SupplyTab } from './SupplyTab';
import deployedContracts from '@/contracts/deployedContracts';

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
  const deployedByChain =
    deployedContracts as Record<number, (typeof deployedContracts)[keyof typeof deployedContracts]>;
  const poolDataProvider = React.useMemo(
    () => (chainId ? deployedByChain[chainId]?.PoolDataProvider : undefined),
    [chainId, deployedByChain],
  );
  const poolDataProviderAbi = poolDataProvider?.abi as Abi | undefined;
  const poolProxy = React.useMemo(
    () => (chainId ? deployedByChain[chainId]?.PoolProxy : undefined),
    [chainId, deployedByChain],
  );
  const poolProxyAbi = poolProxy?.abi as Abi | undefined;

  const tokenColors: Record<string, string> = {
    USDC: '#3B82F6',
    USDT: '#14B8A6',
    WETH: '#A855F7',
    ETH: '#A855F7',
    BNB: '#F59E0B',
    BTC: '#F97316',
    WBTC: '#F97316',
  };

  const activeReserves = React.useMemo(
    () => reserves.filter((reserve) => !reserve.isDropped),
    [reserves],
  );
  console.log('activeReserves', activeReserves);

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

  const userReserveContracts = React.useMemo(
    () =>
      address && poolDataProvider?.address && poolDataProviderAbi
        ? activeReserves.map((reserve) => ({
            address: poolDataProvider.address as `0x${string}`,
            abi: poolDataProviderAbi,
            functionName: 'getUserReserveData' as const,
            args: [reserve.underlyingAsset as `0x${string}`, address] as const,
            chainId,
          }))
        : [],
    [activeReserves, address, chainId, poolDataProvider?.address, poolDataProviderAbi],
  );

  const { data: userReserveResults } = useReadContracts({
    contracts: userReserveContracts,
    query: { enabled: userReserveContracts.length > 0 },
  });

  const reserveConfigContracts = React.useMemo(
    () =>
      poolDataProvider?.address && poolDataProviderAbi
        ? activeReserves.map((reserve) => ({
            address: poolDataProvider.address as `0x${string}`,
            abi: poolDataProviderAbi,
            functionName: 'getReserveConfigurationData' as const,
            args: [reserve.underlyingAsset as `0x${string}`] as const,
            chainId,
          }))
        : [],
    [activeReserves, chainId, poolDataProvider?.address, poolDataProviderAbi],
  );

  const { data: reserveConfigResults } = useReadContracts({
    contracts: reserveConfigContracts,
    query: { enabled: reserveConfigContracts.length > 0 },
  });

  const reserveDataContracts = React.useMemo(
    () =>
      poolDataProvider?.address && poolDataProviderAbi
        ? activeReserves.map((reserve) => ({
            address: poolDataProvider.address as `0x${string}`,
            abi: poolDataProviderAbi,
            functionName: 'getReserveData' as const,
            args: [reserve.underlyingAsset as `0x${string}`] as const,
            chainId,
          }))
        : [],
    [activeReserves, chainId, poolDataProvider?.address, poolDataProviderAbi],
  );

  const { data: reserveDataResults } = useReadContracts({
    contracts: reserveDataContracts,
    query: { enabled: reserveDataContracts.length > 0 },
  });

  const userAccountContracts = React.useMemo(
    () =>
      address && poolProxy?.address && poolProxyAbi
        ? [
            {
              address: poolProxy.address as `0x${string}`,
              abi: poolProxyAbi,
              functionName: 'getUserAccountData' as const,
              args: [address] as const,
              chainId,
            },
          ]
        : [],
    [address, chainId, poolProxy?.address, poolProxyAbi],
  );

  const { data: userAccountResults } = useReadContracts({
    contracts: userAccountContracts,
    query: { enabled: userAccountContracts.length > 0 },
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

  const getUsdValue = (balance: string | undefined, priceInEth?: string) => {
    if (!priceInEth) return '0.00';
    const normalizedBalance = (balance ?? '').replace(/,/g, '').trim();
    if (!normalizedBalance) return '0.00';
    const balanceNumber = new BigNumberJs(normalizedBalance);
    if (!balanceNumber.isFinite()) return '0.00';
    let priceNumber: BigNumberJs | null = null;
    try {
      priceNumber = priceInEth.includes('.')
        ? new BigNumberJs(priceInEth)
        : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    } catch {
      priceNumber = null;
    }
    if (!priceNumber || !priceNumber.isFinite()) return '0.00';
    const value = balanceNumber.times(priceNumber);
    if (!value.isFinite() || value.isNaN()) return '0.00';
    if (value.gt(0) && value.lt(0.01)) return '<0.01';
    return value.toFormat(2);
  };

  const getPriceInEth = (priceInEth?: string) => {
    if (!priceInEth) return null;
    try {
      return priceInEth.includes('.')
        ? new BigNumberJs(priceInEth)
        : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    } catch {
      return null;
    }
  };

  const formatDisplayAmount = (value: string) => {
    const parsedAmount = Number(value);
    if (!Number.isFinite(parsedAmount)) return value;
    return parsedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: parsedAmount >= 1 ? 4 : 8,
    });
  };

  const [depositApySortDirection, setDepositApySortDirection] = React.useState<SortDirection>('desc');
  const [depositBalanceSortDirection, setDepositBalanceSortDirection] = React.useState<SortDirection>('desc');
  const [depositSortKey, setDepositSortKey] = React.useState<'apy' | 'balance'>('apy');
  const [supplyApySortDirection, setSupplyApySortDirection] = React.useState<SortDirection>('desc');
  const [supplyBalanceSortDirection, setSupplyBalanceSortDirection] = React.useState<SortDirection>('desc');
  const [supplySortKey, setSupplySortKey] = React.useState<'apy' | 'balance'>('apy');
  const [borrowAprSortDirection, setBorrowAprSortDirection] = React.useState<SortDirection>('desc');
  const [borrowBalanceSortDirection, setBorrowBalanceSortDirection] = React.useState<SortDirection>('desc');
  const [borrowSortKey, setBorrowSortKey] = React.useState<'apr' | 'balance'>('apr');
  const [availableBorrowAprSortDirection, setAvailableBorrowAprSortDirection] = React.useState<SortDirection>('desc');
  const [availableBorrowBalanceSortDirection, setAvailableBorrowBalanceSortDirection] = React.useState<SortDirection>('desc');
  const [availableBorrowSortKey, setAvailableBorrowSortKey] = React.useState<'apr' | 'balance'>('apr');

  const availableToDeposit = activeReserves.map((reserve) => {
    const balance = balancesBySymbol.get(reserve.symbol);
    return {
      liquidityRate: reserve.liquidityRate?.toString() ?? '0',
      symbol: reserve.symbol,
      name: reserve.name,
      amount: balance ? formatDisplayAmount(balance) : '0',
      value: getUsdValue(balance, reserve.price?.priceInEth),
      color: tokenColors[reserve.symbol] ?? themeColor,
    };
  });

  const getLiquidityRate = (value: unknown) => {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(Math.floor(value));
    if (typeof value === 'string' && value.length > 0) return BigInt(value);
    return 0n;
  };

  const parseDisplayNumber = (value: string) => {
    const normalized = value.replace(/,/g, '').replace('<', '').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const sortedAvailableToDeposit = React.useMemo(() => {
    const items = [...availableToDeposit];
    items.sort((a, b) => {
      if (supplySortKey === 'balance') {
        const aAmount = parseDisplayNumber(a.amount);
        const bAmount = parseDisplayNumber(b.amount);
        if (aAmount === bAmount) return 0;
        if (supplyBalanceSortDirection === 'asc') {
          return aAmount < bAmount ? -1 : 1;
        }
        return aAmount > bAmount ? -1 : 1;
      }
      const aRate = getLiquidityRate(a.liquidityRate);
      const bRate = getLiquidityRate(b.liquidityRate);
      if (aRate === bRate) return 0;
      if (supplyApySortDirection === 'asc') {
        return aRate < bRate ? -1 : 1;
      }
      return aRate > bRate ? -1 : 1;
    });
    return items;
  }, [availableToDeposit, supplySortKey, supplyBalanceSortDirection, supplyApySortDirection]);

  const getBorrowDebt = (result: unknown) => {
    if (!Array.isArray(result)) return 0n;
    const stableDebt = result[1];
    const variableDebt = result[2];
    if (typeof stableDebt !== 'bigint' || typeof variableDebt !== 'bigint') return 0n;
    return stableDebt + variableDebt;
  };

  const getReserveConfigFlags = (result: unknown) => {
    if (!Array.isArray(result)) return null;
    const borrowingEnabled = result[6];
    const isActive = result[8];
    const isFrozen = result[9];
    if (typeof borrowingEnabled !== 'boolean' || typeof isActive !== 'boolean' || typeof isFrozen !== 'boolean') {
      return null;
    }
    return { borrowingEnabled, isActive, isFrozen };
  };

  const getAvailableLiquidity = (result: unknown) => {
    if (!Array.isArray(result)) return 0n;
    const totalBToken = result[2];
    const totalStableDebt = result[3];
    const totalVariableDebt = result[4];
    if (
      typeof totalBToken !== 'bigint' ||
      typeof totalStableDebt !== 'bigint' ||
      typeof totalVariableDebt !== 'bigint'
    ) {
      return 0n;
    }
    const available = totalBToken - totalStableDebt - totalVariableDebt;
    return available > 0n ? available : 0n;
  };

  const availableBorrowBase = React.useMemo(() => {
    const result = userAccountResults?.[0];
    if (result?.status !== 'success' || !Array.isArray(result.result)) {
      return 0n;
    }
    const availableBorrowsBase = result.result[2];
    return typeof availableBorrowsBase === 'bigint' ? availableBorrowsBase : 0n;
  }, [userAccountResults]);

  const deposits = activeReserves
    .map((reserve, index) => {
      const result = supplyBalanceResults?.[index];
      if (result?.status !== 'success' || typeof result.result !== 'bigint' || result.result <= 0n) {
        return null;
      }
      const decimals = Number(reserve.decimals ?? 18);
      const tokenAmount = formatUnits(result.result, decimals);
      const displayAmount = formatDisplayAmount(tokenAmount);
      const supplyApy = Number(formatUnits(BigInt(reserve.liquidityRate ?? '0'), 27)) * 100;
      return {
        symbol: reserve.symbol,
        amount: `${displayAmount}`,
        value: getUsdValue(displayAmount, reserve.price?.priceInEth),
        liquidityRate: reserve.liquidityRate?.toString() ?? '0',
        apyValue: supplyApy,
        color: tokenColors[reserve.symbol] ?? themeColor,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const sortedDeposits = React.useMemo(() => {
    const items = [...deposits];
    items.sort((a, b) => {
      if (depositSortKey === 'balance') {
        const aAmount = parseDisplayNumber(a.amount);
        const bAmount = parseDisplayNumber(b.amount);
        if (aAmount === bAmount) return 0;
        if (depositBalanceSortDirection === 'asc') {
          return aAmount < bAmount ? -1 : 1;
        }
        return aAmount > bAmount ? -1 : 1;
      }
      if (a.apyValue === b.apyValue) return 0;
      if (depositApySortDirection === 'asc') {
        return a.apyValue < b.apyValue ? -1 : 1;
      }
      return a.apyValue > b.apyValue ? -1 : 1;
    });
    return items;
  }, [deposits, depositSortKey, depositBalanceSortDirection, depositApySortDirection]);

  const availableToBorrow = activeReserves
    .map((reserve, index) => {
      const configResult = reserveConfigResults?.[index];
      const flags = configResult?.status === 'success' ? getReserveConfigFlags(configResult.result) : null;
      if (flags && (!flags.borrowingEnabled || !flags.isActive || flags.isFrozen)) {
        return null;
      }
      const reserveDataResult = reserveDataResults?.[index];
      const availableLiquidity =
        reserveDataResult?.status === 'success' ? getAvailableLiquidity(reserveDataResult.result) : 0n;
      const decimals = Number(reserve.decimals ?? 18);
      const liquidityAmount = new BigNumberJs(formatUnits(availableLiquidity, decimals));
      const availableBorrowBaseAmount = new BigNumberJs(formatUnits(availableBorrowBase, 8));
      const priceInEth = getPriceInEth(reserve.price?.priceInEth);
      const availableByUser = priceInEth && priceInEth.gt(0)
        ? availableBorrowBaseAmount.div(priceInEth)
        : new BigNumberJs(0);
      const maxBorrowAmount = BigNumberJs.min(availableByUser, liquidityAmount);
      const amountString = maxBorrowAmount.isFinite()
        ? maxBorrowAmount.toFixed(8, BigNumberJs.ROUND_DOWN)
        : '0';
      const displayAmount = formatDisplayAmount(amountString);
      const borrowApr = Number(formatUnits(BigInt(reserve.variableBorrowRate ?? '0'), 27)) * 100;
      return {
        symbol: reserve.symbol,
        amount: displayAmount,
        value: getUsdValue(displayAmount, reserve.price?.priceInEth),
        apr: `${borrowApr.toFixed(2)}%`,
        aprValue: borrowApr,
        color: tokenColors[reserve.symbol] ?? themeColor,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const sortedAvailableToBorrow = React.useMemo(() => {
    const items = [...availableToBorrow];
    items.sort((a, b) => {
      if (availableBorrowSortKey === 'balance') {
        const aAmount = parseDisplayNumber(a.amount);
        const bAmount = parseDisplayNumber(b.amount);
        if (aAmount === bAmount) return 0;
        if (availableBorrowBalanceSortDirection === 'asc') {
          return aAmount < bAmount ? -1 : 1;
        }
        return aAmount > bAmount ? -1 : 1;
      }
      if (a.aprValue === b.aprValue) return 0;
      if (availableBorrowAprSortDirection === 'asc') {
        return a.aprValue < b.aprValue ? -1 : 1;
      }
      return a.aprValue > b.aprValue ? -1 : 1;
    });
    return items;
  }, [
    availableToBorrow,
    availableBorrowSortKey,
    availableBorrowBalanceSortDirection,
    availableBorrowAprSortDirection,
  ]);

  const borrows = activeReserves
    .map((reserve, index) => {
      const result = userReserveResults?.[index];
      if (result?.status !== 'success') return null;
      const debt = getBorrowDebt(result.result);
      if (debt <= 0n) return null;
      const decimals = Number(reserve.decimals ?? 18);
      const tokenAmount = formatUnits(debt, decimals);
      const displayAmount = formatDisplayAmount(tokenAmount);
      const borrowApr = Number(formatUnits(BigInt(reserve.variableBorrowRate ?? '0'), 27)) * 100;
      return {
        symbol: reserve.symbol,
        amount: displayAmount,
        value: getUsdValue(displayAmount, reserve.price?.priceInEth),
        apr: `${borrowApr.toFixed(2)}%`,
        aprValue: borrowApr,
        color: tokenColors[reserve.symbol] ?? themeColor,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const sortedBorrows = React.useMemo(() => {
    const items = [...borrows];
    items.sort((a, b) => {
      if (borrowSortKey === 'balance') {
        const aAmount = parseDisplayNumber(a.amount);
        const bAmount = parseDisplayNumber(b.amount);
        if (aAmount === bAmount) return 0;
        if (borrowBalanceSortDirection === 'asc') {
          return aAmount < bAmount ? -1 : 1;
        }
        return aAmount > bAmount ? -1 : 1;
      }
      if (a.aprValue === b.aprValue) return 0;
      if (borrowAprSortDirection === 'asc') {
        return a.aprValue < b.aprValue ? -1 : 1;
      }
      return a.aprValue > b.aprValue ? -1 : 1;
    });
    return items;
  }, [borrows, borrowSortKey, borrowBalanceSortDirection, borrowAprSortDirection]);

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
                onToggleDepositApySort={() => {
                  setDepositSortKey('apy');
                  setDepositApySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                onToggleDepositBalanceSort={() => {
                  setDepositSortKey('balance');
                  setDepositBalanceSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                onToggleSupplyApySort={() => {
                  setSupplySortKey('apy');
                  setSupplyApySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                onToggleSupplyBalanceSort={() => {
                  setSupplySortKey('balance');
                  setSupplyBalanceSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                themeColor={themeColor}
              />
            </View>

            <View style={{ width: pageWidth }}>
              <BorrowTab
                borrows={sortedBorrows}
                availableToBorrow={sortedAvailableToBorrow}
                onToggleBorrowBalanceSort={() => {
                  setBorrowSortKey('balance');
                  setBorrowBalanceSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                onToggleBorrowAprSort={() => {
                  setBorrowSortKey('apr');
                  setBorrowAprSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                onToggleAvailableBorrowBalanceSort={() => {
                  setAvailableBorrowSortKey('balance');
                  setAvailableBorrowBalanceSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                onToggleAvailableBorrowAprSort={() => {
                  setAvailableBorrowSortKey('apr');
                  setAvailableBorrowAprSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                themeColor={themeColor}
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
