import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';

export default function TransferScreen() {
  const insets = useSafeAreaInsets();
  const [fromAmount, setFromAmount] = useState('0.0');
  const [toAmount, setToAmount] = useState('0.0');

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <DashboardHeader title="Swap" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-[#6B7280]">Exchange assets instantly</Text>

        <View className="mt-2 bg-white rounded-[20px] p-4 gap-4 shadow-md">
          <View className="gap-2">
            <Text className="text-[13px] font-bold text-[#6B7280]">From</Text>
            <View className="flex-row items-center justify-between bg-[#F8FAFF] rounded-[14px] px-3 py-3">
              <Text className="text-sm font-bold text-[#2F6DF6]">USDC</Text>
              <TextInput
                value={fromAmount}
                onChangeText={setFromAmount}
                keyboardType="decimal-pad"
                className="text-base font-bold text-[#111827] min-w-[80px] text-right"
              />
            </View>
            <Text className="text-xs font-semibold text-[#9CA3AF]">Balance: 1,240.50 USDC</Text>
          </View>

          <View className="h-px bg-[#E5E7EB]" />

          <View className="gap-2">
            <Text className="text-[13px] font-bold text-[#6B7280]">To</Text>
            <View className="flex-row items-center justify-between bg-[#F8FAFF] rounded-[14px] px-3 py-3">
              <Text className="text-sm font-bold text-[#A855F7]">WETH</Text>
              <TextInput
                value={toAmount}
                onChangeText={setToAmount}
                keyboardType="decimal-pad"
                className="text-base font-bold text-[#111827] min-w-[80px] text-right"
              />
            </View>
            <Text className="text-xs font-semibold text-[#9CA3AF]">Rate: 1 USDC ≈ 0.00031 WETH</Text>
          </View>

          <Pressable className="bg-[#2F6DF6] py-3 rounded-[14px] items-center">
            <Text className="text-[15px] font-bold text-white">Swap Now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
