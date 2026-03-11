import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TokenIcon } from '@/components/TokenIcon';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  themeColor: string;
};

export function BorrowTab({
  borrows,
  availableToBorrow,
  onToggleBorrowBalanceSort,
  onToggleBorrowAprSort,
  onToggleAvailableBorrowBalanceSort,
  onToggleAvailableBorrowAprSort,
  themeColor,
}: BorrowTabProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between">
        <Text className="text-lg font-bold text-[#111827]">Your borrows</Text>
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
                <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                  Debt
                </Text>
                <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
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
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                APR (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
            </>
          )}
          </Pressable>
        </View>
        
      </View>

      {borrows.length === 0 ? (
        <View className="bg-white rounded-2xl p-4 shadow-md">
          <Text className="text-[13px] text-[#6B7280]">No borrowed assets yet</Text>
        </View>
      ) : (
        borrows.map((item) => (
          <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                <TokenIcon symbol={item.symbol} size={28} />
              </View>
              <View>
                <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
              </View>
            </View>
            <View className="flex-row gap-6 items-center">
              <View className="flex items-end">
                <Text className="text-[16px] font-bold text-[#353638] mt-0.5">{item.amount}</Text>
                <Text className="text-[13px] text-[#6B7280] mt-0.5">${item.value}</Text>
              </View>
              <View className="bg-[#DC2626] rounded-full px-2 py-0.5 w-20 items-center justify-center">
                <Text className="text-sm font-bold text-white">{item.apr}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <View className="flex-row items-end justify-between">
        <Text className="mt-1.5 text-base font-bold text-[#111827]">Available to Borrow</Text>
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
                <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                  Available
                </Text>
                <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
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
                <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                  APR (%)
                </Text>
                <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
              </>
            )}
          </Pressable>
        </View>

      </View>

      {availableToBorrow.map((item) => (
        <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
              <TokenIcon symbol={item.symbol} size={28} />
            </View>
            <View>
              <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
            </View>
          </View>
          <View className="flex-row gap-6 items-center">
            <View className="flex items-end">
              <Text className="text-[16px] font-bold text-[#353638] mt-0.5">{item.amount}</Text>
              <Text className="text-[13px] text-[#6B7280] mt-0.5">${item.value}</Text>
            </View>
            <View className="bg-[#DC2626] rounded-full px-2 py-0.5 w-20 items-center justify-center">
              <Text className="text-sm font-bold text-white">{item.apr}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
