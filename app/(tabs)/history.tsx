import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const items = [
    { id: '1', title: 'Deposit USDC', time: 'Today, 09:24', amount: '+$500.00' },
    { id: '2', title: 'Swap to WETH', time: 'Yesterday, 18:10', amount: '-$320.40' },
    { id: '3', title: 'Borrow USDC', time: 'Mar 06, 14:02', amount: '+$750.00' },
  ];

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <DashboardHeader title="History" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-[#6B7280]">Recent activity</Text>
        <View className="mt-2 bg-white rounded-[20px] p-4 gap-3 shadow-md">
          {items.map((item) => (
            <View key={item.id} className="flex-row items-center justify-between">
              <View>
                <Text className="text-[15px] font-bold text-[#111827]">{item.title}</Text>
                <Text className="text-xs text-[#9CA3AF] mt-1">{item.time}</Text>
              </View>
              <Text className="text-sm font-bold text-[#2F6DF6]">{item.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
