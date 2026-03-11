import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TokenIcon } from '@/components/TokenIcon';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppTheme } from '@/constants/AppTheme';

type BorrowItem = {
  symbol: string;
  amount: string;
  apr: string;
  value: string;
  color: string;
};

type AvailableBorrowItem = {
  symbol: string;
  amount: string;
  apr: string;
  value: string;
  color: string;
};

type BorrowTabProps = {
  borrows: BorrowItem[];
  availableToBorrow: AvailableBorrowItem[];
  onToggleBorrowBalanceSort: () => void;
  onToggleBorrowAprSort: () => void;
  onToggleAvailableBorrowBalanceSort: () => void;
  onToggleAvailableBorrowAprSort: () => void;
  onTokenPress: (symbol: string) => void;
  themeColor: string;
  isDark: boolean;
};

export function BorrowTab({
  borrows,
  availableToBorrow,
  onToggleBorrowBalanceSort,
  onToggleBorrowAprSort,
  onToggleAvailableBorrowBalanceSort,
  onToggleAvailableBorrowAprSort,
  onTokenPress,
  themeColor,
  isDark,
}: BorrowTabProps) {
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between">
        <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>Your borrows</Text>
        <View className="flex-row items-end gap-6">
          <Pressable
            className="flex-row gap-1 items-end"
            onPress={onToggleBorrowBalanceSort}
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
                  Debt
                </Text>
                <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
              </>
            )}
          </Pressable>
          <Pressable
          className="flex-row gap-1 w-20 justify-end mr-4 h-6 items-end"
          onPress={onToggleBorrowAprSort}
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
                APR (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
            </>
          )}
          </Pressable>
        </View>
        
      </View>

      {borrows.length === 0 ? (
        <View className="rounded-2xl p-4 shadow-md" style={{ backgroundColor: colors.cardBg }}>
          <Text className="text-[13px]" style={{ color: colors.textSecondary }}>No borrowed assets yet</Text>
        </View>
      ) : (
        borrows.map((item) => (
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
              <View className="rounded-full px-2 py-0.5 w-20 items-center justify-center" style={{ backgroundColor: colors.danger }}>
                <Text className="text-sm font-bold text-white">{item.apr}</Text>
              </View>
            </View>
          </Pressable>
        ))
      )}

      <View className="flex-row items-end justify-between">
        <Text className="mt-1.5 text-base font-bold" style={{ color: colors.textPrimary }}>Available to Borrow</Text>
         <View className="flex-row items-end gap-6">
          <Pressable
            className="flex-row gap-1 items-end"
            onPress={onToggleAvailableBorrowBalanceSort}
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
                  Available
                </Text>
                <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
              </>
            )}
          </Pressable>
          <Pressable
            className="flex-row gap-1 w-20 justify-end mr-4 h-6 items-end"
            onPress={onToggleAvailableBorrowAprSort}
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
                  APR (%)
                </Text>
                <FontAwesome name="sort" size={12} color={pressed ? themeColor : colors.textMuted} />
              </>
            )}
          </Pressable>
        </View>

      </View>

      {availableToBorrow.map((item) => (
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
            <View className="rounded-full px-2 py-0.5 w-20 items-center justify-center" style={{ backgroundColor: colors.danger }}>
              <Text className="text-sm font-bold text-white">{item.apr}</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
