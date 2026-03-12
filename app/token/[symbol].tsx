import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, type Href } from 'expo-router';
import BigNumberJs from 'bignumber.js';
import { formatUnits, type Abi } from 'viem';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { TokenIcon } from '@/components/TokenIcon';
import { TokenActionPanel } from '@/components/TokenActionPanel';
import { ExternalLink } from '@/components/ExternalLink';
import { useGlobalState } from '@/store/useGlobalState';
import { useAppearanceState } from '@/store/useAppearanceState';
import { fetchReserveAprHistory, type ReserveAprPoint } from '@/services/graph/fetch';
import { AppTheme } from '@/constants/AppTheme';
import { useReadContracts } from 'wagmi';
import bTokenAbi from '@/contracts/IBTokenABI.json';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function normalizeSymbol(symbol?: string | string[]) {
  if (Array.isArray(symbol)) return symbol[0] ?? '';
  return symbol ?? '';
}

function formatAmount(raw: string | undefined, decimals: number) {
  if (!raw) return '0';
  try {
    const normalized = formatUnits(BigInt(raw), decimals);
    const amount = new BigNumberJs(normalized);
    if (!amount.isFinite()) return '0';
    if (amount.gt(0) && amount.lt(0.0001)) return '<0.0001';
    return amount.toFormat(4);
  } catch {
    return '0';
  }
}

function formatOraclePrice(priceInEth?: string) {
  if (!priceInEth) return '0.00';
  try {
    const value = priceInEth.includes('.')
      ? new BigNumberJs(priceInEth)
      : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    if (!value.isFinite()) return '0.00';
    if (value.gt(0) && value.lt(0.01)) return '0.00';
    return value.toFormat(2);
  } catch {
    return '0.00';
  }
}

function formatPercentFromDecimal(value?: string) {
  if (!value) return '0.00%';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '0.00%';
  const percentage = parsed <= 1 ? parsed * 100 : parsed;
  return `${percentage.toFixed(2)}%`;
}

function formatPercentFromBps(value?: string) {
  if (!value) return '0.00%';
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '0.00%';
  return `${(parsed / 100).toFixed(2)}%`;
}

function formatCompactNumber(raw: string | undefined, decimals: number) {
  const amount = Number(formatAmount(raw, decimals).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return '0';
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`;
  return amount.toFixed(2);
}

function formatCompactTokenAmount(amount: BigNumberJs) {
  if (!amount.isFinite()) return '0';
  if (amount.gte(1_000_000_000)) return `${amount.div(1_000_000_000).toFormat(2)}B`;
  if (amount.gte(1_000_000)) return `${amount.div(1_000_000).toFormat(2)}M`;
  if (amount.gte(1_000)) return `${amount.div(1_000).toFormat(2)}K`;
  return amount.toFormat(2);
}

function formatCompactUsdValue(raw: string | undefined, decimals: number, priceInEth?: string) {
  if (!raw || !priceInEth) return '0.00';
  try {
    const tokenAmount = new BigNumberJs(formatUnits(BigInt(raw), decimals));
    const price = priceInEth.includes('.')
      ? new BigNumberJs(priceInEth)
      : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    if (!tokenAmount.isFinite() || !price.isFinite()) return '0.00';
    const value = tokenAmount.times(price);
    if (!value.isFinite() || value.isNaN()) return '0.00';
    if (value.gt(0) && value.lt(0.01)) return '0.00';
    return value.toFormat(2);
  } catch {
    return '0.00';
  }
}

function formatCompactUsdValueFromTokens(tokenAmount: BigNumberJs, priceInEth?: string) {
  if (!priceInEth) return '0.00';
  try {
    const price = priceInEth.includes('.')
      ? new BigNumberJs(priceInEth)
      : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    if (!tokenAmount.isFinite() || !price.isFinite()) return '0.00';
    const value = tokenAmount.times(price);
    if (!value.isFinite() || value.isNaN()) return '0.00';
    if (value.gt(0) && value.lt(0.01)) return '0.00';
    return value.toFormat(2);
  } catch {
    return '0.00';
  }
}

function buildLinePoints({
  count,
  width,
  height,
  seed,
  base,
  swing,
}: {
  count: number;
  width: number;
  height: number;
  seed: number;
  base: number;
  swing: number;
}) {
  const points: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = (i / (count - 1)) * width;
    const noise = Math.sin((i + seed) * 1.37) * 0.45 + Math.cos((i + seed) * 0.72) * 0.2;
    const value = Math.max(0, Math.min(1, base + noise * swing));
    const y = (1 - value) * height;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(' ');
}

function buildLinePointsFromValues(values: number[], width: number, height: number) {
  if (values.length === 0) return '';
  if (values.length === 1) {
    const y = height / 2;
    return `0,${y.toFixed(2)} ${width.toFixed(2)},${y.toFixed(2)}`;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points: string[] = [];
  values.forEach((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const normalized = (value - min) / range;
    const y = height - normalized * height;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  });
  return points.join(' ');
}

const EXPLORER_BASE_BY_CHAIN: Record<number, string> = {
  56: 'https://bscscan.com',
  97: 'https://testnet.bscscan.com',
  688689: 'https://atlantic.pharosscan.xyz',
};

function formatShortDate(timestamp?: number) {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}/${day}`;
}

function ProgressRing({ percent, isDark }: { percent: number; isDark: boolean }) {
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  const size = 78;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - normalized / 100);

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.success}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="text-sm font-bold absolute" style={{ color: colors.textPrimary }}>{normalized.toFixed(2)}%</Text>
    </View>
  );
}

function PlaceholderChart({
  lineColor,
  avgLabel,
  points,
  xLabels,
  isDark,
}: {
  lineColor: string;
  avgLabel: string;
  points: string;
  xLabels: [string, string, string];
  isDark: boolean;
}) {
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  return (
    <View className="mt-3 rounded-2xl border px-3 py-2.5" style={{ backgroundColor: colors.cardAltBg, borderColor: colors.border }}>
      <View className="self-start rounded-full px-3 py-1 border" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{avgLabel}</Text>
      </View>
      <Svg width="100%" height={124} viewBox="0 0 320 124">
        <Line x1="0" y1="35" x2="320" y2="35" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
        <Line x1="0" y1="70" x2="320" y2="70" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
        <Line x1="0" y1="105" x2="320" y2="105" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
        <Polyline points={points} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" />
      </Svg>
      <View className="flex-row justify-between px-1">
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{xLabels[0]}</Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{xLabels[1]}</Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{xLabels[2]}</Text>
      </View>
    </View>
  );
}

export default function TokenDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol?: string | string[] }>();
  const normalizedSymbol = normalizeSymbol(symbol);
  const reserves = useGlobalState((state) => state.reserves);
  const chainId = useGlobalState((state) => state.chainId);
  const themeMode = useAppearanceState((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  const reserve = reserves.find((item) => item.symbol === normalizedSymbol);
  const [range, setRange] = React.useState<'1w' | '1m' | '6m' | '1y'>('1w');
  const [aprHistory, setAprHistory] = React.useState<ReserveAprPoint[]>([]);
  const [actionType, setActionType] = React.useState<'supply' | 'borrow' | 'withdraw' | 'repay'>('supply');
  const [actionAmount, setActionAmount] = React.useState('');

  const collectorContracts = React.useMemo(
    () =>
      reserve?.bToken?.id
        ? [
            {
              address: reserve.bToken.id as `0x${string}`,
              abi: bTokenAbi as Abi,
              functionName: 'RESERVE_TREASURY_ADDRESS' as const,
              chainId,
            },
          ]
        : [],
    [reserve?.bToken?.id, chainId],
  );

  const { data: collectorResults } = useReadContracts({
    contracts: collectorContracts,
    query: { enabled: collectorContracts.length > 0 },
  });

  const collectorAddress = React.useMemo(() => {
    const result = collectorResults?.[0];
    if (result?.status !== 'success') return undefined;
    return typeof result.result === 'string' ? result.result : undefined;
  }, [collectorResults]);

  const collectorExplorerUrl = React.useMemo<string | undefined>(() => {
    if (!collectorAddress || !chainId) return undefined;
    const baseUrl = EXPLORER_BASE_BY_CHAIN[chainId];
    if (!baseUrl) return undefined;
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBase}/address/${collectorAddress}`;
  }, [collectorAddress, chainId]);

  const supplyCapTokens = React.useMemo(
    () => new BigNumberJs(reserve?.supplyCap ?? '0'),
    [reserve?.supplyCap],
  );
  const borrowCapTokens = React.useMemo(
    () => new BigNumberJs(reserve?.borrowCap ?? '0'),
    [reserve?.borrowCap],
  );
  const isSupplyCapZero = supplyCapTokens.isZero();
  const isBorrowCapZero = borrowCapTokens.isZero();

  React.useEffect(() => {
    let active = true;
    const rangeToSeconds: Record<'1w' | '1m' | '6m' | '1y', number> = {
      '1w': 7 * 24 * 60 * 60,
      '1m': 30 * 24 * 60 * 60,
      '6m': 180 * 24 * 60 * 60,
      '1y': 365 * 24 * 60 * 60,
    };
    const load = async () => {
      if (!normalizedSymbol || !chainId) {
        if (active) setAprHistory([]);
        return;
      }
      try {
        const startTimestamp = Math.floor(Date.now() / 1000) - rangeToSeconds[range];
        const history = await fetchReserveAprHistory({
          chainId,
          symbol: normalizedSymbol,
          startTimestamp,
        });
        if (active) setAprHistory(history);
      } catch {
        if (active) setAprHistory([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [chainId, normalizedSymbol, range]);

  if (!reserve) {
    return (
      <View className="flex-1 px-5 py-6" style={{ backgroundColor: colors.pageBg }}>
        <Stack.Screen options={{ title: normalizedSymbol || 'Token Detail' }} />
        <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>未找到该 Token 的储备信息</Text>
      </View>
    );
  }

  const decimals = Number(reserve.decimals ?? 18);
  const totalBorrowed = (BigInt(reserve.totalPrincipalStableDebt ?? '0') + BigInt(reserve.totalCurrentVariableDebt ?? '0')).toString();
  const liquidationPenalty = Math.max(Number(reserve.reserveLiquidationBonus ?? '0') - 10000, 0).toString();
  const utilization = Number(reserve.utilizationRate ?? '0');
  const utilizationRatePercent = Number.isFinite(utilization) ? (utilization <= 1 ? utilization * 100 : utilization) : 0;
  const totalSuppliesTokens = new BigNumberJs(formatUnits(BigInt(reserve.totalSupplies ?? '0'), decimals));
  const totalBorrowedTokens = new BigNumberJs(formatUnits(BigInt(totalBorrowed), decimals));
  const supplyCapRatio = isSupplyCapZero
    ? new BigNumberJs(0)
    : totalSuppliesTokens.dividedBy(supplyCapTokens).times(100);
  const borrowCapRatio = isBorrowCapZero
    ? new BigNumberJs(0)
    : totalBorrowedTokens.dividedBy(borrowCapTokens).times(100);
  const supplyCapRatioPercent = supplyCapRatio.isFinite() ? supplyCapRatio.toNumber() : 0;
  const borrowCapRatioPercent = borrowCapRatio.isFinite() ? borrowCapRatio.toNumber() : 0;
  const supplyApy = Number(formatUnits(BigInt(reserve.liquidityRate ?? '0'), 27)) * 100;
  const borrowApy = Number(formatUnits(BigInt(reserve.variableBorrowRate ?? '0'), 27)) * 100;
  const historyForChart = aprHistory.length > 1
    ? aprHistory
    : [
        { supplyApr: supplyApy, borrowApr: borrowApy, timestamp: Math.floor(Date.now() / 1000), date: new Date().toISOString() },
        { supplyApr: supplyApy, borrowApr: borrowApy, timestamp: Math.floor(Date.now() / 1000), date: new Date().toISOString() },
      ];
  const supplyValues = historyForChart.map((item) => item.supplyApr);
  const borrowValues = historyForChart.map((item) => item.borrowApr);
  const supplyAvg = supplyValues.reduce((sum, value) => sum + value, 0) / supplyValues.length;
  const borrowAvg = borrowValues.reduce((sum, value) => sum + value, 0) / borrowValues.length;
  const supplyLinePoints = buildLinePointsFromValues(supplyValues, 320, 105);
  const borrowLinePoints = buildLinePointsFromValues(borrowValues, 320, 105);
  const middleIndex = Math.floor((historyForChart.length - 1) / 2);
  const xLabels: [string, string, string] = [
    formatShortDate(historyForChart[0]?.timestamp),
    formatShortDate(historyForChart[middleIndex]?.timestamp),
    formatShortDate(historyForChart[historyForChart.length - 1]?.timestamp),
  ];

  const modelUtilizationPoints = buildLinePoints({
    count: 24,
    width: 320,
    height: 120,
    seed: reserve.symbol.length * 9,
    base: Math.min(Math.max(utilizationRatePercent / 100, 0.2), 0.95),
    swing: 0.08,
  });
  const modelBorrowPoints = buildLinePoints({
    count: 24,
    width: 320,
    height: 120,
    seed: reserve.symbol.length * 13,
    base: Math.min(Math.max(borrowApy / 100, 0.18), 0.9),
    swing: 0.05,
  });

  const metrics = [
    { label: 'Reserve Size', value: `$ ${formatCompactUsdValue(reserve.totalLiquidity, decimals, reserve.price?.priceInEth)}` },
    { label: 'Available liquidity', value: `$ ${formatCompactUsdValue(reserve.availableLiquidity, decimals, reserve.price?.priceInEth)}` },
    { label: 'Utilization Rate', value: formatPercentFromDecimal(reserve.utilizationRate) },
    { label: 'Oracle price', value: `$ ${formatOraclePrice(reserve.price?.priceInEth)}` },
  ];
  return (
    <View className="flex-1" style={{ backgroundColor: colors.pageBg }}>
      <Stack.Screen options={{ title: `${reserve.symbol} Detail`, headerStyle: { backgroundColor: colors.pageBg } }} />
      <ScrollView contentContainerClassName="px-4 py-5 gap-3.5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="rounded-3xl p-4" style={{ backgroundColor: colors.cardBg}}>
          <View className="flex-row items-center gap-3">
            <TokenIcon symbol={reserve.symbol} size={36} />
            <View className="flex-1">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>{reserve.symbol}</Text>
              <Text className="text-[18px] leading-8 font-bold" style={{ color: colors.textPrimary }}>{reserve.name}</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap mt-3">
            {metrics.map((item) => (
              <View key={item.label} className="w-1/2 mt-3 pr-2">
                <Text className="text-base" style={{ color: colors.textSecondary }}>{item.label}</Text>
                <Text className="text-[19px] leading-6 font-bold mt-0.5" style={{ color: colors.textPrimary }}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <TokenActionPanel
          reserveSymbol={reserve.symbol}
          reserveName={reserve.name}
          decimals={decimals}
          totalSupplies={reserve.totalSupplies}
          totalBorrowed={totalBorrowed}
          availableLiquidity={reserve.availableLiquidity}
          priceInEth={reserve.price?.priceInEth}
          supplyApy={supplyApy}
          borrowApy={borrowApy}
          formatCompactNumber={formatCompactNumber}
          actionType={actionType}
          onActionTypeChange={setActionType}
          actionAmount={actionAmount}
          onActionAmountChange={setActionAmount}
        />

        <View className="rounded-3xl p-4 " style={{ backgroundColor: colors.cardBg}}>
          <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>Supply Info</Text>
          <View className="flex-row items-center mt-3">
            <ProgressRing percent={supplyCapRatioPercent} isDark={isDark} />
            <View className="ml-3 flex-1">
              <Text className="text-BASE" style={{ color: colors.textSecondary }}>Total supplied</Text>
              <Text className="text-[18px] leading-6 font-bold" style={{ color: colors.textPrimary }}>
                {formatCompactNumber(reserve.totalSupplies, decimals)} of {isSupplyCapZero ? '∞' : formatCompactTokenAmount(supplyCapTokens)}
              </Text>
              <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                $ {formatCompactUsdValue(reserve.totalSupplies, decimals, reserve.price?.priceInEth)} of $ {isSupplyCapZero ? '∞' : formatCompactUsdValueFromTokens(supplyCapTokens, reserve.price?.priceInEth)}
              </Text>
            </View>
            <View className="ml-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>APY</Text>
              <Text className="text-[20px] leading-6 font-bold mt-0.5" style={{ color: colors.textPrimary }}>{supplyApy.toFixed(2)}%</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-3">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.cyan }} />
            <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>Supply APR</Text>
            <View className="ml-auto flex-row rounded-xl overflow-hidden" style={{ backgroundColor: colors.cardAltBg }}>
              <Pressable onPress={() => setRange('1w')} className="px-3 py-1.5" style={{ backgroundColor: range === '1w' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '1w' ? colors.textPrimary : colors.textSecondary }}>1w</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1m')} className="px-3 py-1.5" style={{ backgroundColor: range === '1m' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '1m' ? colors.textPrimary : colors.textSecondary }}>1m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('6m')} className="px-3 py-1.5" style={{ backgroundColor: range === '6m' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '6m' ? colors.textPrimary : colors.textSecondary }}>6m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1y')} className="px-3 py-1.5" style={{ backgroundColor: range === '1y' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '1y' ? colors.textPrimary : colors.textSecondary }}>1y</Text>
              </Pressable>
            </View>
          </View>
          <PlaceholderChart lineColor={colors.cyan} avgLabel={`Avg ${supplyAvg.toFixed(2)}%`} points={supplyLinePoints} xLabels={xLabels} isDark={isDark} />
        </View>

        <View className="rounded-3xl p-4 " style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>Collateral usage</Text>
          <Text className="text-sm font-semibold mt-1.5" style={{ color: colors.success }}>Can be collateral</Text>
          <View className="flex-row gap-2.5 mt-3">
            <View className="flex-1 border rounded-2xl p-4" style={{ borderColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Max LTV</Text>
              <Text className="text-lg font-bold mt-1.5" style={{ color: colors.textPrimary }}>{formatPercentFromBps(reserve.baseLTVasCollateral)}</Text>
            </View>
            <View className="flex-1 border rounded-2xl p-4" style={{ borderColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Liquidation threshold</Text>
              <Text className="text-lg font-bold mt-1.5" style={{ color: colors.textPrimary }}>{formatPercentFromBps(reserve.reserveLiquidationThreshold)}</Text>
            </View>
            <View className="flex-1 border rounded-2xl p-4" style={{ borderColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Liquidation penalty</Text>
              <Text className="text-lg font-bold mt-1.5" style={{ color: colors.textPrimary }}>{formatPercentFromBps(liquidationPenalty)}</Text>
            </View>
          </View>
        </View>

        <View className="rounded-3xl p-4 " style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>Borrow info</Text>
          <View className="flex-row items-center mt-3">
            <ProgressRing percent={borrowCapRatioPercent} isDark={isDark} />
            <View className="ml-3 flex-1">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Total borrowed</Text>
              <Text className="text-[18px] leading-6 font-bold" style={{ color: colors.textPrimary }}>
                {formatCompactNumber(totalBorrowed, decimals)} of {isBorrowCapZero ? '∞' : formatCompactTokenAmount(borrowCapTokens)}
              </Text>
              <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                $ {formatCompactUsdValue(totalBorrowed, decimals, reserve.price?.priceInEth)} of $ {isBorrowCapZero ? '∞' : formatCompactUsdValueFromTokens(borrowCapTokens, reserve.price?.priceInEth)}
              </Text>
            </View>
            <View className="ml-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Borrow APY</Text>
              <Text className="text-[20px] leading-6 font-bold mt-0.5" style={{ color: colors.textPrimary }}>{borrowApy.toFixed(2)}%</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-3">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.purple }} />
            <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>Borrow APR, variable</Text>
            <View className="ml-auto flex-row rounded-xl overflow-hidden" style={{ backgroundColor: colors.cardAltBg }}>
              <Pressable onPress={() => setRange('1w')} className="px-3 py-1.5" style={{ backgroundColor: range === '1w' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '1w' ? colors.textPrimary : colors.textSecondary }}>1w</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1m')} className="px-3 py-1.5" style={{ backgroundColor: range === '1m' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '1m' ? colors.textPrimary : colors.textSecondary }}>1m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('6m')} className="px-3 py-1.5" style={{ backgroundColor: range === '6m' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '6m' ? colors.textPrimary : colors.textSecondary }}>6m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1y')} className="px-3 py-1.5" style={{ backgroundColor: range === '1y' ? colors.accent : 'transparent' }}>
                <Text className="text-sm font-semibold" style={{ color: range === '1y' ? colors.textPrimary : colors.textSecondary }}>1y</Text>
              </Pressable>
            </View>
          </View>
          <PlaceholderChart lineColor={colors.purple} avgLabel={`Avg ${borrowAvg.toFixed(2)}%`} points={borrowLinePoints} xLabels={xLabels} isDark={isDark} />
        </View>

        <View className="rounded-3xl p-4" style={{ backgroundColor: colors.cardBg }}>
          <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>Collector Info</Text>
          <View className="flex-row mt-3 gap-2.5">
            <View className="flex-1 border rounded-2xl p-4" style={{ borderColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Reserve factor</Text>
              <Text className="text-lg font-bold mt-1.5" style={{ color: colors.textPrimary }}>{formatPercentFromBps(reserve.reserveFactor)}</Text>
            </View>
            <View className="flex-1 border rounded-2xl p-4" style={{ borderColor: colors.border }}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Collector Contract</Text>
              {collectorExplorerUrl ? (
                <View className="flex flex-row items-center gap-1 h-8 ">
                  <ExternalLink href={collectorExplorerUrl as Href & string} >
                    <Text className="text-lg font-bold" style={{ color: colors.textPrimary }} numberOfLines={1}>
                      {collectorAddress ? 'View contract' : '-'}
                    </Text>
                  </ExternalLink>
                  <FontAwesome name="external-link" size={16} style={{ color: colors.textSecondary }} />
                </View>
                

              ) : (
                <Text className="text-lg font-bold mt-1.5" style={{ color: colors.textPrimary }} numberOfLines={1}>
                  {collectorAddress ?? '-'}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View className="rounded-3xl p-4 " style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Interest rate model</Text>
          <View className="flex-row items-center justify-between mt-3">
            <View>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Utilization Rate</Text>
              <Text className="text-[20px] leading-6 font-bold mt-0.5" style={{ color: colors.textPrimary }}>{formatPercentFromDecimal(reserve.utilizationRate)}</Text>
            </View>
            <Pressable className="rounded-xl border px-3.5 py-2" style={{ borderColor: colors.border }}>
              <Text className="text-xs font-bold tracking-wide" style={{ color: colors.textSecondary }}>INTEREST RATE STRATEGY</Text>
            </Pressable>
          </View>
          <View className="flex-row items-center mt-3">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.purple }} />
            <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>Borrow APR, variable</Text>
            <View className="h-2.5 w-2.5 rounded-full ml-4" style={{ backgroundColor: colors.accent }} />
            <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>Utilization Rate</Text>
          </View>
          <View className="mt-3 rounded-2xl border px-3 py-2.5" style={{ backgroundColor: colors.cardAltBg, borderColor: colors.border }}>
            <Svg width="100%" height={136} viewBox="0 0 320 136">
              <Line x1="0" y1="40" x2="320" y2="40" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="80" x2="320" y2="80" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="120" x2="320" y2="120" stroke={colors.lineGrid} strokeWidth="1" strokeDasharray="4 4" />
              <Polyline points={modelBorrowPoints} fill="none" stroke={colors.purple} strokeWidth="3" />
              <Polyline points={modelUtilizationPoints} fill="none" stroke={colors.accent} strokeWidth="3" />
            </Svg>
            <View className="flex-row justify-between px-1">
              <Text className="text-xs" style={{ color: colors.textSecondary }}>0%</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>25%</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>50%</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>75%</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>100%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
