import React from 'react';
import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatAPY } from '@/utils/common';

type DepositItem = {
  symbol: string;
  amount: string;
  apy: string;
  apyValue: number;
  color: string;
  icon: string;
};

type AvailableDepositItem = {
  symbol: string;
  amount: string;
  color: string;
  icon: string;
  liquidityRate: string;
};

type SupplyTabProps = {
  sortedDeposits: DepositItem[];
  sortedAvailableToDeposit: AvailableDepositItem[];
  onToggleDepositApySort: () => void;
  onToggleSupplyApySort: () => void;
  themeColor: string;
};

export function SupplyTab({
  sortedDeposits,
  sortedAvailableToDeposit,
  onToggleDepositApySort,
  onToggleSupplyApySort,
  themeColor,
}: SupplyTabProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-[#111827]">Your supplies</Text>
        <Pressable
          className="flex-row items-center gap-1 rounded px-2 py-1 h-10"
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
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                APY (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
            </>
          )}
        </Pressable>
      </View>

      {sortedDeposits.length === 0 ? (
        <View className="bg-white rounded-2xl p-4 shadow-md">
          <Text className="text-[13px] text-[#6B7280]">No supplied assets yet</Text>
        </View>
      ) : (
        sortedDeposits.map((item) => (
          <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                <Text className="text-lg font-bold" style={{ color: item.color }}>
                  {item.icon}
                </Text>
              </View>
              <View>
                <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
                <Text className="text-[13px] text-[#6B7280] mt-0.5">{item.amount}</Text>
              </View>
            </View>
            <View className="items-end gap-1">
              <Text className="text-sm font-bold text-[#16A34A]">{item.apy}</Text>
            </View>
          </View>
        ))
      )}

      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-[#111827]">Assets to supply</Text>
        <Pressable
          className="flex-row items-center gap-1 rounded px-2 py-1 h-10"
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
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                APY (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
            </>
          )}
        </Pressable>
      </View>
      {sortedAvailableToDeposit.map((item) => (
        <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
              <Text className="text-lg font-bold" style={{ color: item.color }}>
                {item.icon}
              </Text>
            </View>
            <View>
              <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
              <Text className="text-[13px] text-[#6B7280] mt-0.5">balance: {item.amount}</Text>
            </View>
          </View>
          <Text className="text-sm font-bold text-[#16A34A]">{formatAPY(item.liquidityRate)}</Text>
        </View>
      ))}
    </View>
  );
}
