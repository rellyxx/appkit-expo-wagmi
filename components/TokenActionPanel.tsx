import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import BigNumberJs from 'bignumber.js';
import { formatUnits } from 'viem';
import { TokenIcon } from '@/components/TokenIcon';
import { AppTheme } from '@/constants/AppTheme';
import { useAppearanceState } from '@/store/useAppearanceState';
import { useGlobalState } from '@/store/useGlobalState';
import { calcHealth, formatBigintToString } from '@/utils/common';

type ActionOption = {
  key: 'supply' | 'borrow' | 'withdraw' | 'repay';
  label: string;
  color: string;
};

type InfoItem = {
  label: string;
  value: string;
};

type TokenActionPanelProps = {
  reserveSymbol: string;
  reserveName: string;
  decimals: number;
  totalSupplies: string | undefined;
  totalBorrowed: string;
  availableLiquidity: string | undefined;
  priceInEth: string | undefined;
  supplyApy: number;
  borrowApy: number;
  formatCompactNumber: (raw: string | undefined, decimals: number) => string;
  actionType: ActionOption['key'];
  onActionTypeChange: (next: ActionOption['key']) => void;
  actionAmount: string;
  onActionAmountChange: (next: string) => void;
};

export function TokenActionPanel({
  reserveSymbol,
  reserveName,
  decimals,
  totalSupplies,
  totalBorrowed,
  availableLiquidity,
  priceInEth,
  supplyApy,
  borrowApy,
  formatCompactNumber,
  actionType,
  onActionTypeChange,
  actionAmount,
  onActionAmountChange,
}: TokenActionPanelProps) {
  const amountInputRef = React.useRef<TextInput>(null);
  const themeMode = useAppearanceState((state) => state.themeMode);
  const healthFactor = useGlobalState((state) => state.healthFactor);
  const userAccountData = useGlobalState((state) => state.userAccountData);
  const isDark = themeMode === 'dark';
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  const actionOptions = [
    { key: 'supply', label: 'Supply', color: colors.cyan },
    { key: 'borrow', label: 'Borrow', color: colors.purple },
    { key: 'withdraw', label: 'Withdraw', color: colors.accent },
    { key: 'repay', label: 'Repay', color: colors.success },
  ] as const;

  const actionBalanceLabelMap: Record<ActionOption['key'], string> = {
    supply: 'Wallet balance',
    borrow: 'Available liquidity',
    withdraw: 'Supplied balance',
    repay: 'Borrowed balance',
  };

  const actionBalanceValueMap: Record<ActionOption['key'], string> = {
    supply: '-',
    borrow: `${formatCompactNumber(availableLiquidity, decimals)} ${reserveSymbol}`,
    withdraw: `${formatCompactNumber(totalSupplies, decimals)} ${reserveSymbol}`,
    repay: `${formatCompactNumber(totalBorrowed, decimals)} ${reserveSymbol}`,
  };

  const parsePriceInEth = (value?: string) => {
    if (!value) return null;
    try {
      return value.includes('.')
        ? new BigNumberJs(value)
        : new BigNumberJs(formatUnits(BigInt(value), 8));
    } catch {
      return null;
    }
  };

  const buildPredictedHealthFactor = () => {
    if (!actionAmount.trim()) return healthFactor;
    if (!userAccountData.length) return healthFactor;
    const cleanedAmount = actionAmount.replace(/,/g, '').trim();
    const amount = new BigNumberJs(cleanedAmount);
    if (!amount.isFinite() || amount.lte(0)) return healthFactor;
    const price = parsePriceInEth(priceInEth);
    if (!price || !price.isFinite()) return healthFactor;
    const inputValUSD = amount.times(price);
    if (!inputValUSD.isFinite()) return healthFactor;
    const totalCollateralBase = new BigNumberJs(formatBigintToString(userAccountData[0], 8));
    const totalDebtBase = new BigNumberJs(formatBigintToString(userAccountData[1], 8));
    if (actionType === 'supply' || actionType === 'withdraw') {
      const adjustedCollateral = actionType === 'supply'
        ? totalCollateralBase.plus(inputValUSD)
        : BigNumberJs.max(totalCollateralBase.minus(inputValUSD), 0);
      return calcHealth({
        userAccountData,
        supplyBalance: adjustedCollateral.toString(),
      });
    }
    const adjustedDebt = actionType === 'borrow'
      ? totalDebtBase.plus(inputValUSD)
      : BigNumberJs.max(totalDebtBase.minus(inputValUSD), 0);
    return calcHealth({
      userAccountData,
      borrowBalance: adjustedDebt.toString(),
    });
  };

  const displayHealthFactor = buildPredictedHealthFactor();

  const actionInfoMap: Record<ActionOption['key'], InfoItem[]> = {
    supply: [
      { label: 'Supply APY', value: `${supplyApy.toFixed(2)}%` },
      { label: 'Health factor', value: displayHealthFactor },
    ],
    borrow: [
      { label: 'Borrow APY', value: `${borrowApy.toFixed(2)}%` },
      { label: 'Health factor', value: displayHealthFactor },

    ],
    withdraw: [
      { label: 'Supply APY', value: `${supplyApy.toFixed(2)}%` },
      { label: 'Health factor', value: displayHealthFactor },

    ],
    repay: [
      { label: 'Borrow APY', value: `${borrowApy.toFixed(2)}%` },
      { label: 'Health factor', value: displayHealthFactor },

    ],
  };

  const actionCtaLabel = (() => {
    switch (actionType) {
      case 'supply':
        return `Supply ${reserveSymbol}`;
      case 'borrow':
        return `Borrow ${reserveSymbol}`;
      case 'withdraw':
        return `Withdraw ${reserveSymbol}`;
      default:
        return `Repay ${reserveSymbol}`;
    }
  })();

  const actionBalanceLabel = actionBalanceLabelMap[actionType];
  const actionBalanceValue = actionBalanceValueMap[actionType];
  const actionInfoItems = actionInfoMap[actionType];
  const hasInputAmount = actionAmount.trim().length > 0;
  const healthFactorNumber = displayHealthFactor === '∞'
    ? Number.POSITIVE_INFINITY
    : Number(displayHealthFactor.replace('<', ''));
  const healthFactorColor = Number.isFinite(healthFactorNumber)
    ? healthFactorNumber >= 2
      ? colors.success
      : healthFactorNumber >= 1.2
        ? colors.accent
        : colors.danger
    : colors.textSecondary;

  return (
    <View className="rounded-3xl p-4" style={{ backgroundColor: colors.cardBg }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>Actions</Text>
        <View className="flex-row rounded-2xl overflow-hidden" style={{ backgroundColor: colors.cardAltBg }}>
          {actionOptions.map((option) => {
            const isActive = actionType === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => onActionTypeChange(option.key)}
                className="px-3 py-2"
                style={{ backgroundColor: isActive ? option.color : 'transparent' }}
              >
                <Text className="text-sm font-semibold" style={{ color: isActive ? colors.textPrimary : colors.textSecondary }}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-3 rounded-2xl p-3" style={{ backgroundColor: colors.cardAltBg }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <TokenIcon symbol={reserveSymbol} size={24} />
            <View>
              <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{reserveSymbol}</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{reserveName}</Text>
            </View>
          </View>
          <Pressable className="rounded-full px-3 py-1" style={{ backgroundColor: colors.border }}>
            <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>MAX</Text>
          </Pressable>
        </View>
        <Pressable className="flex-row items-center mt-3" onPress={() => amountInputRef.current?.focus()}>
          <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Amount</Text>
          <TextInput
            ref={amountInputRef}
            value={actionAmount}
            onChangeText={onActionAmountChange}
            keyboardType="decimal-pad"
            className="ml-auto text-right text-lg font-bold min-w-[80px]"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            style={{ color: colors.textPrimary }}
          />
        </Pressable>
        <Text className="text-xs mt-2" style={{ color: colors.textMuted }}>
          {actionBalanceLabel}: {actionBalanceValue}
        </Text>
      </View>

      <View className="mt-3 flex-row flex-wrap">
        {actionInfoItems.map((item) => (
          <View key={item.label} className="w-1/2 pr-2 mt-2">
            <View className="rounded-2xl px-3 py-2.5" style={{ backgroundColor: colors.cardAltBg }}>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{item.label}</Text>
              {item.label === 'Health factor' ? (
                hasInputAmount ? (
                  <Text className="text-base font-bold mt-1" style={{ color: colors.textPrimary }}>
                    {healthFactor}
                    <Text style={{ color: healthFactorColor }}> → {item.value}</Text>
                  </Text>
                ) : (
                  <Text className="text-base font-bold mt-1" style={{ color: colors.textPrimary }}>
                    {healthFactor}
                  </Text>
                )
              ) : (
              <Text
                className="text-base font-bold mt-1"
                style={{ color: colors.textPrimary }}
              >
                {item.value}
              </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <Pressable className="mt-4 rounded-2xl py-3 items-center" style={{ backgroundColor: colors.accent }}>
        <Text className="text-[15px] font-bold text-white">{actionCtaLabel}</Text>
      </Pressable>
    </View>
  );
}
