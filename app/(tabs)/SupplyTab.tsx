import React from 'react';
import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatAPY } from '@/utils/common';
import { TokenIcon } from '@/components/TokenIcon';
import { AppTheme } from '@/constants/AppTheme';

type SupplyItem = {
  symbol: string;
  amount: string;
  value: string;
  color: string;
  liquidityRate: string;
};

type SupplyTabProps = {
  sortedDeposits: SupplyItem[];
  sortedAvailableToDeposit: SupplyItem[];
  onToggleDepositApySort: () => void;
  onToggleDepositBalanceSort: () => void;
  onToggleSupplyApySort: () => void;
  onToggleSupplyBalanceSort: () => void;
  onTokenPress: (symbol: string) => void;
  themeColor: string;
  isDark: boolean;
};

export function SupplyTab({
  sortedDeposits,
  sortedAvailableToDeposit,
  onToggleDepositApySort,
  onToggleDepositBalanceSort,
  onToggleSupplyApySort,
  onToggleSupplyBalanceSort,
  onTokenPress,
  themeColor,
  isDark,
}: SupplyTabProps) {
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between">
        <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>Your supplies</Text>
        <View className="flex-row items-end gap-6">
        <Pressable
          className="flex-row gap-1 items-end"
          onPress={onToggleDepositBalanceSort}
          style={({ pressed }) => [
            pressed
              ? {
                  opacity: 0.75,
                  transform: [{ scale: 0.94 }],
                  backgroundColor: 'rgba(17,24,39,0.1)',
                }
              : null,
          ]}
        >
          {({ pressed }) => (
            <>
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : colors.textMuted }}>
                Balance
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
            </>
          )}
        </Pressable>
        <Pressable
          className="flex-row gap-1 w-20 justify-end mr-4 h-6 items-end"
          onPress={onToggleDepositApySort}
          style={({ pressed }) => [
            pressed
              ? {
                  opacity: 0.75,
                  transform: [{ scale: 0.94 }],
                  backgroundColor: 'rgba(17,24,39,0.1)',
                }
              : null,
          ]}
        >
          {({ pressed }) => (
            <>
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : colors.textMuted }}>
                APY (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
            </>
          )}
        </Pressable>
      </View>
      </View>

      {sortedDeposits.length === 0 ? (
        <View className="rounded-2xl p-4 shadow-md" style={{ backgroundColor: colors.cardBg }}>
          <Text className="text-[13px]" style={{ color: colors.textSecondary }}>No supplied assets yet</Text>
        </View>
      ) : (
        sortedDeposits.map((item) => (
          <Pressable
            key={item.symbol}
            onPress={() => onTokenPress(item.symbol)}
            className="rounded-2xl p-4 flex-row items-center justify-between shadow-md"
            style={{ backgroundColor: colors.cardBg }}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                <TokenIcon symbol={item.symbol} size={28} />
              </View>
              <View>
                <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>{item.symbol}</Text>
              </View>
            </View>
            <View className="flex-row gap-6 items-center">
              <View className="flex items-end">
                <Text className="text-[16px] font-bold mt-0.5" style={{ color: colors.textPrimary }}>{item.amount}</Text>
                <Text className="text-[13px] mt-0.5" style={{ color: colors.textSecondary }}>${item.value}</Text>
              </View>
              <View className="rounded-full px-2 py-0.5 w-20 items-center justify-center" style={{ backgroundColor: colors.success }}>
                <Text className="text-sm font-bold text-white">{formatAPY(item.liquidityRate)}</Text>
              </View>
            </View>
          </Pressable>
        ))
      )}

      <View className="flex-row items-end justify-between">
        <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>Assets to supply</Text>
        <View className="flex-row items-end gap-6">
        <Pressable
          className="flex-row gap-1 items-end"
          onPress={onToggleSupplyBalanceSort}
          style={({ pressed }) => [
            pressed
              ? {
                  opacity: 0.75,
                  transform: [{ scale: 0.94 }],
                  backgroundColor: 'rgba(17,24,39,0.1)',
                }
              : null,
          ]}
        >
          {({ pressed }) => (
            <>
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : colors.textMuted }}>
                Wallet Balance
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
            </>
          )}
        </Pressable>
        <Pressable
          className="flex-row gap-1 w-20 justify-end mr-4 h-6 items-end"
          onPress={onToggleSupplyApySort}
          style={({ pressed }) => [
            pressed
              ? {
                  opacity: 0.75,
                  transform: [{ scale: 0.94 }],
                    backgroundColor: 'rgba(17,24,39,0.1)',
                }
              : null,
          ]}
        >
          {({ pressed }) => (
            <>
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : colors.textMuted }}>
                APY (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
            </>
          )}
        </Pressable>
        </View>

      </View>
      {sortedAvailableToDeposit.map((item) => (
        <Pressable
          key={item.symbol}
          onPress={() => onTokenPress(item.symbol)}
          className="rounded-2xl p-4 flex-row items-center justify-between shadow-md"
          style={{ backgroundColor: colors.cardBg }}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
              <TokenIcon symbol={item.symbol} size={28} />
            </View>
            <View>
              <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>{item.symbol}</Text>
            </View>
           
          </View>
          <View className='flex-row gap-6 items-center'>
            <View className='flex items-end'>
              <Text className="text-[16px] font-bold mt-0.5" style={{ color: colors.textPrimary }}>{item.amount}</Text>
              <Text className="text-[13px] mt-0.5" style={{ color: colors.textSecondary }}>${item.value}</Text>
            </View>
            <View className='rounded-full px-2 py-0.5 w-20 items-center justify-center' style={{ backgroundColor: colors.success }}>
                <Text className="text-sm font-bold text-white">{formatAPY(item.liquidityRate)}</Text>
            </View>
          </View>

         
        </Pressable>
      ))}
    </View>
  );
}
