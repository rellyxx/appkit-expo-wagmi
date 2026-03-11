import React from 'react';
import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { formatAPY } from '@/utils/common';
import { TokenIcon } from '@/components/TokenIcon';

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
  themeColor: string;
};

export function SupplyTab({
  sortedDeposits,
  sortedAvailableToDeposit,
  onToggleDepositApySort,
  onToggleDepositBalanceSort,
  onToggleSupplyApySort,
  onToggleSupplyBalanceSort,
  themeColor,
}: SupplyTabProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-end justify-between">
        <Text className="text-lg font-bold text-[#111827]">Your supplies</Text>
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
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                Balance
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
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
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                APY (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
            </>
          )}
        </Pressable>
      </View>
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
              <View className="bg-[#16A34A] rounded-full px-2 py-0.5 w-20 items-center justify-center">
                <Text className="text-sm font-bold text-white">{formatAPY(item.liquidityRate)}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <View className="flex-row items-end justify-between">
        <Text className="text-lg font-bold text-[#111827]">Assets to supply</Text>
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
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                Wallet Balance
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
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
              <Text className="text-xs font-semibold" style={{ color: pressed ? themeColor : '#9CA3AF' }}>
                APY (%)
              </Text>
              <FontAwesome name="sort" size={12} color={pressed ? themeColor : '#9CA3AF'} />
            </>
          )}
        </Pressable>
        </View>

      </View>
      {sortedAvailableToDeposit.map((item) => (
        <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
              <TokenIcon symbol={item.symbol} size={28} />
            </View>
            <View>
              <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
            </View>
           
          </View>
          <View className='flex-row gap-6 items-center'>
            <View className='flex items-end'>
              <Text className="text-[16px] font-bold text-[#353638] mt-0.5">{item.amount}</Text>
              <Text className="text-[13px] text-[#6B7280] mt-0.5">${item.value}</Text>
            </View>
            <View className='bg-[#16A34A] rounded-full px-2 py-0.5 w-20 items-center justify-center'>
                <Text className="text-sm font-bold text-white">{formatAPY(item.liquidityRate)}</Text>
            </View>
          </View>

         
        </View>
      ))}
    </View>
  );
}
