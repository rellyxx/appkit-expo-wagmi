import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, type Href } from 'expo-router';
import BigNumberJs from 'bignumber.js';
import { formatUnits, type Abi } from 'viem';
import Svg, { Line, Polyline } from 'react-native-svg';
import { TokenIcon } from '@/components/TokenIcon';
import { TokenActionPanel } from '@/components/TokenActionPanel';
import { ExternalLink } from '@/components/ExternalLink';
import { ProgressRing } from '@/components/ProgressRing';
import { PlaceholderChart } from '@/components/PlaceholderChart';
import { useGlobalState } from '@/store/useGlobalState';
import { useAppearanceState } from '@/store/useAppearanceState';
import { fetchReserveAprHistory, type ReserveAprPoint } from '@/services/graph/fetch';
import { AppTheme } from '@/constants/AppTheme';
import { useReadContracts } from 'wagmi';
import bTokenAbi from '@/contracts/IBTokenABI.json';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  EXPLORER_BASE_BY_CHAIN,
  buildLinePoints,
  buildLinePointsFromValues,
  formatCompactNumber,
  formatCompactTokenAmount,
  formatCompactUsdValue,
  formatCompactUsdValueFromTokens,
  formatOraclePrice,
  formatPercentFromBps,
  formatPercentFromDecimal,
  formatShortDate,
  normalizeSymbol,
} from '@/utils/token';



type TokenActionType = 'supply' | 'borrow' | 'withdraw' | 'repay';

const isTokenActionType = (value: unknown): value is TokenActionType =>
  value === 'supply' || value === 'borrow' || value === 'withdraw' || value === 'repay';

export default function TokenDetailScreen() {
  const { symbol, actionType: actionTypeParam } = useLocalSearchParams<{
    symbol?: string | string[];
    actionType?: string | string[];
  }>();
  const normalizedSymbol = normalizeSymbol(symbol);
  const reserves = useGlobalState((state) => state.reserves);
  const chainId = useGlobalState((state) => state.chainId);
  const themeMode = useAppearanceState((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  const reserve = reserves.find((item) => item.symbol === normalizedSymbol);
  const [range, setRange] = React.useState<'1w' | '1m' | '6m' | '1y'>('1w');
  const [aprHistory, setAprHistory] = React.useState<ReserveAprPoint[]>([]);
  const [actionType, setActionType] = React.useState<TokenActionType>('supply');
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

  React.useEffect(() => {
    const next = Array.isArray(actionTypeParam) ? actionTypeParam[0] : actionTypeParam;
    if (isTokenActionType(next)) {
      setActionType(next);
      return;
    }
    setActionType('supply');
  }, [actionTypeParam]);

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
          tokenAddress={reserve.underlyingAsset}
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
