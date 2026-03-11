import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TokenIcon } from '@/components/TokenIcon';

type BorrowItem = {
  symbol: string;
  amount: string;
  apr: string;
  value: string;
  color: string;
  icon: string;
};

type AvailableBorrowItem = {
  symbol: string;
  amount: string;
  color: string;
  icon: string;
};

type BorrowTabProps = {
  borrows: BorrowItem[];
  availableToBorrow: AvailableBorrowItem[];
  themeColor: string;
};

export function BorrowTab({ borrows, availableToBorrow, themeColor }: BorrowTabProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-[#111827]">My Borrows</Text>
        <Text className="text-xs font-semibold text-[#9CA3AF]">APR (%)</Text>
      </View>

      {borrows.map((item) => (
        <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
              <TokenIcon symbol={item.symbol} size={28} />
            </View>
            <View>
              <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
              <Text className="text-[13px] text-[#6B7280] mt-0.5">{item.amount}</Text>
            </View>
          </View>
          <View className="items-end gap-1">
            <Text className="text-sm font-bold text-[#DC2626]">{item.apr}</Text>
            <Text className="text-[13px] text-[#6B7280]">{item.value}</Text>
          </View>
        </View>
      ))}

      <Text className="mt-1.5 text-base font-bold text-[#111827]">Available to Borrow</Text>

      {availableToBorrow.map((item) => (
        <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
              <TokenIcon symbol={item.symbol} size={28} />
            </View>
            <View>
              <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
              <Text className="text-[13px] text-[#6B7280] mt-0.5">{item.amount}</Text>
            </View>
          </View>
          <Pressable className="px-4 py-2 rounded-xl" style={{ backgroundColor: themeColor }}>
            <Text className="text-[13px] font-bold text-white">Borrow</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
