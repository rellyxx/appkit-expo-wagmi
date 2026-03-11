import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import BigNumberJs from 'bignumber.js';
import { formatUnits } from 'viem';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { TokenIcon } from '@/components/TokenIcon';
import { useGlobalState } from '@/store/useGlobalState';
import { fetchReserveAprHistory, type ReserveAprPoint } from '@/services/graph/fetch';

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
  if (!priceInEth) return '0';
  try {
    const value = priceInEth.includes('.')
      ? new BigNumberJs(priceInEth)
      : new BigNumberJs(formatUnits(BigInt(priceInEth), 8));
    if (!value.isFinite()) return '0';
    if (value.gt(0) && value.lt(0.0001)) return '<0.0001';
    return value.toFormat(6);
  } catch {
    return '0';
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

function formatShortDate(timestamp?: number) {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}/${day}`;
}

function ProgressRing({ percent }: { percent: number }) {
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
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22C55E"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="text-sm font-bold text-[#111827] absolute">{normalized.toFixed(2)}%</Text>
    </View>
  );
}

function PlaceholderChart({
  lineColor,
  avgLabel,
  points,
  xLabels,
}: {
  lineColor: string;
  avgLabel: string;
  points: string;
  xLabels: [string, string, string];
}) {
  return (
    <View className="mt-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2.5">
      <View className="self-start bg-white rounded-full px-3 py-1 border border-[#E5E7EB]">
        <Text className="text-sm font-semibold text-[#111827]">{avgLabel}</Text>
      </View>
      <Svg width="100%" height={124} viewBox="0 0 320 124">
        <Line x1="0" y1="35" x2="320" y2="35" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
        <Line x1="0" y1="70" x2="320" y2="70" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
        <Line x1="0" y1="105" x2="320" y2="105" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
        <Polyline points={points} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" />
      </Svg>
      <View className="flex-row justify-between px-1">
        <Text className="text-xs text-[#6B7280]">{xLabels[0]}</Text>
        <Text className="text-xs text-[#6B7280]">{xLabels[1]}</Text>
        <Text className="text-xs text-[#6B7280]">{xLabels[2]}</Text>
      </View>
    </View>
  );
}

export default function TokenDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol?: string | string[] }>();
  const normalizedSymbol = normalizeSymbol(symbol);
  const reserves = useGlobalState((state) => state.reserves);
  const chainId = useGlobalState((state) => state.chainId);
  const reserve = reserves.find((item) => item.symbol === normalizedSymbol);
  const [range, setRange] = React.useState<'1w' | '1m' | '6m' | '1y'>('1w');
  const [aprHistory, setAprHistory] = React.useState<ReserveAprPoint[]>([]);

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
      <View className="flex-1 bg-[#F4F6FB] px-5 py-6">
        <Stack.Screen options={{ title: normalizedSymbol || 'Token Detail' }} />
        <Text className="text-base font-semibold text-[#111827]">未找到该 Token 的储备信息</Text>
      </View>
    );
  }

  const decimals = Number(reserve.decimals ?? 18);
  const totalBorrowed = (BigInt(reserve.totalPrincipalStableDebt ?? '0') + BigInt(reserve.totalCurrentVariableDebt ?? '0')).toString();
  const liquidationPenalty = Math.max(Number(reserve.reserveLiquidationBonus ?? '0') - 10000, 0).toString();
  const utilization = Number(reserve.utilizationRate ?? '0');
  const utilizationRatePercent = Number.isFinite(utilization) ? (utilization <= 1 ? utilization * 100 : utilization) : 0;
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
    { label: 'Reserve Size', value: `$ ${formatCompactNumber(reserve.totalLiquidity, decimals)}` },
    { label: 'Available liquidity', value: `$ ${formatCompactNumber(reserve.availableLiquidity, decimals)}` },
    { label: 'Utilization Rate', value: formatPercentFromDecimal(reserve.utilizationRate) },
    { label: 'Oracle price', value: `$ ${formatOraclePrice(reserve.price?.priceInEth)}` },
  ];

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <Stack.Screen options={{ title: `${reserve.symbol} Detail`, headerStyle: { backgroundColor: '#F4F6FB' } }} />
      <ScrollView contentContainerClassName="px-4 py-5 gap-3.5 pb-10" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-3xl p-4 border border-[#E5E7EB]">
          <View className="flex-row items-center gap-3">
            <TokenIcon symbol={reserve.symbol} size={36} />
            <View className="flex-1">
              <Text className="text-sm text-[#6B7280]">{reserve.symbol}</Text>
              <Text className="text-[28px] leading-8 font-bold text-[#111827]">{reserve.name}</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap mt-3">
            {metrics.map((item) => (
              <View key={item.label} className="w-1/2 mt-3 pr-2">
                <Text className="text-sm text-[#6B7280]">{item.label}</Text>
                <Text className="text-[19px] leading-6 font-bold text-[#111827] mt-0.5">{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-3xl p-4 border border-[#E5E7EB]">
          <Text className="text-2xl font-bold text-[#111827]">Supply Info</Text>
          <View className="flex-row items-center mt-3">
            <ProgressRing percent={utilizationRatePercent} />
            <View className="ml-3 flex-1">
              <Text className="text-sm text-[#6B7280]">Total supplied</Text>
              <Text className="text-[18px] leading-6 font-bold text-[#111827]">
                {formatCompactNumber(reserve.totalSupplies, decimals)} of {formatCompactNumber(reserve.totalLiquidity, decimals)}
              </Text>
              <Text className="text-sm text-[#6B7280] mt-0.5">
                $ {formatCompactNumber(reserve.totalSupplies, decimals)} of $ {formatCompactNumber(reserve.totalLiquidity, decimals)}
              </Text>
            </View>
            <View className="ml-2">
              <Text className="text-sm text-[#6B7280]">APY</Text>
              <Text className="text-[20px] leading-6 font-bold text-[#111827] mt-0.5">{supplyApy.toFixed(2)}%</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-3">
            <View className="h-2.5 w-2.5 rounded-full bg-[#22D3EE]" />
            <Text className="text-sm text-[#6B7280] ml-2">Supply APR</Text>
            <View className="ml-auto flex-row bg-[#EEF2FF] rounded-xl overflow-hidden">
              <Pressable onPress={() => setRange('1w')} className={`px-3 py-1.5 ${range === '1w' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '1w' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>1w</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1m')} className={`px-3 py-1.5 ${range === '1m' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '1m' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>1m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('6m')} className={`px-3 py-1.5 ${range === '6m' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '6m' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>6m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1y')} className={`px-3 py-1.5 ${range === '1y' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '1y' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>1y</Text>
              </Pressable>
            </View>
          </View>
          <PlaceholderChart lineColor="#22D3EE" avgLabel={`Avg ${supplyAvg.toFixed(2)}%`} points={supplyLinePoints} xLabels={xLabels} />
        </View>

        <View className="bg-white rounded-3xl p-4 border border-[#E5E7EB]">
          <Text className="text-2xl font-bold text-[#111827]">Collateral usage</Text>
          <Text className="text-[#22C55E] text-sm font-semibold mt-1.5">Can be collateral</Text>
          <View className="flex-row gap-2.5 mt-3">
            <View className="flex-1 border border-[#E5E7EB] rounded-2xl p-4">
              <Text className="text-sm text-[#6B7280]">Max LTV</Text>
              <Text className="text-lg font-bold text-[#111827] mt-1.5">{formatPercentFromBps(reserve.baseLTVasCollateral)}</Text>
            </View>
            <View className="flex-1 border border-[#E5E7EB] rounded-2xl p-4">
              <Text className="text-sm text-[#6B7280]">Liquidation threshold</Text>
              <Text className="text-lg font-bold text-[#111827] mt-1.5">{formatPercentFromBps(reserve.reserveLiquidationThreshold)}</Text>
            </View>
            <View className="flex-1 border border-[#E5E7EB] rounded-2xl p-4">
              <Text className="text-sm text-[#6B7280]">Liquidation penalty</Text>
              <Text className="text-lg font-bold text-[#111827] mt-1.5">{formatPercentFromBps(liquidationPenalty)}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-4 border border-[#E5E7EB]">
          <Text className="text-2xl font-bold text-[#111827]">Borrow info</Text>
          <View className="flex-row items-center mt-3">
            <ProgressRing percent={utilizationRatePercent} />
            <View className="ml-3 flex-1">
              <Text className="text-sm text-[#6B7280]">Total borrowed</Text>
              <Text className="text-[18px] leading-6 font-bold text-[#111827]">
                {formatCompactNumber(totalBorrowed, decimals)} of {formatCompactNumber(reserve.totalLiquidity, decimals)}
              </Text>
              <Text className="text-sm text-[#6B7280] mt-0.5">
                $ {formatCompactNumber(totalBorrowed, decimals)} of $ {formatCompactNumber(reserve.totalLiquidity, decimals)}
              </Text>
            </View>
            <View className="ml-2">
              <Text className="text-sm text-[#6B7280]">Borrow APY</Text>
              <Text className="text-[20px] leading-6 font-bold text-[#111827] mt-0.5">{borrowApy.toFixed(2)}%</Text>
            </View>
          </View>
          <View className="flex-row items-center mt-3">
            <View className="h-2.5 w-2.5 rounded-full bg-[#D946EF]" />
            <Text className="text-sm text-[#6B7280] ml-2">Borrow APR, variable</Text>
            <View className="ml-auto flex-row bg-[#EEF2FF] rounded-xl overflow-hidden">
              <Pressable onPress={() => setRange('1w')} className={`px-3 py-1.5 ${range === '1w' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '1w' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>1w</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1m')} className={`px-3 py-1.5 ${range === '1m' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '1m' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>1m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('6m')} className={`px-3 py-1.5 ${range === '6m' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '6m' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>6m</Text>
              </Pressable>
              <Pressable onPress={() => setRange('1y')} className={`px-3 py-1.5 ${range === '1y' ? 'bg-white' : ''}`}>
                <Text className={`text-sm font-semibold ${range === '1y' ? 'text-[#111827]' : 'text-[#6B7280]'}`}>1y</Text>
              </Pressable>
            </View>
          </View>
          <PlaceholderChart lineColor="#D946EF" avgLabel={`Avg ${borrowAvg.toFixed(2)}%`} points={borrowLinePoints} xLabels={xLabels} />
        </View>

        <View className="bg-white rounded-3xl p-4 border border-[#E5E7EB]">
          <Text className="text-2xl font-bold text-[#111827]">Collector Info</Text>
          <View className="flex-row mt-3 gap-2.5">
            <View className="flex-1 border border-[#E5E7EB] rounded-2xl p-4">
              <Text className="text-sm text-[#6B7280]">Reserve factor</Text>
              <Text className="text-lg font-bold text-[#111827] mt-1.5">{formatPercentFromBps(reserve.reserveFactor)}</Text>
            </View>
            <View className="flex-1 border border-[#E5E7EB] rounded-2xl p-4">
              <Text className="text-sm text-[#6B7280]">Total borrowed</Text>
              <Text className="text-lg font-bold text-[#111827] mt-1.5">{formatCompactNumber(totalBorrowed, decimals)}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-4 border border-[#E5E7EB]">
          <Text className="text-2xl font-bold text-[#111827]">Interest rate model</Text>
          <View className="flex-row items-center justify-between mt-3">
            <View>
              <Text className="text-sm text-[#6B7280]">Utilization Rate</Text>
              <Text className="text-[20px] leading-6 font-bold text-[#111827] mt-0.5">{formatPercentFromDecimal(reserve.utilizationRate)}</Text>
            </View>
            <Pressable className="rounded-xl border border-[#D1D5DB] px-3.5 py-2">
              <Text className="text-xs font-bold tracking-wide text-[#374151]">INTEREST RATE STRATEGY</Text>
            </Pressable>
          </View>
          <View className="flex-row items-center mt-3">
            <View className="h-2.5 w-2.5 rounded-full bg-[#D946EF]" />
            <Text className="text-sm text-[#6B7280] ml-2">Borrow APR, variable</Text>
            <View className="h-2.5 w-2.5 rounded-full bg-[#2563EB] ml-4" />
            <Text className="text-sm text-[#6B7280] ml-2">Utilization Rate</Text>
          </View>
          <View className="mt-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2.5">
            <Svg width="100%" height={136} viewBox="0 0 320 136">
              <Line x1="0" y1="40" x2="320" y2="40" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="80" x2="320" y2="80" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
              <Line x1="0" y1="120" x2="320" y2="120" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
              <Polyline points={modelBorrowPoints} fill="none" stroke="#D946EF" strokeWidth="3" />
              <Polyline points={modelUtilizationPoints} fill="none" stroke="#2563EB" strokeWidth="3" />
            </Svg>
            <View className="flex-row justify-between px-1">
              <Text className="text-xs text-[#6B7280]">0%</Text>
              <Text className="text-xs text-[#6B7280]">25%</Text>
              <Text className="text-xs text-[#6B7280]">50%</Text>
              <Text className="text-xs text-[#6B7280]">75%</Text>
              <Text className="text-xs text-[#6B7280]">100%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
