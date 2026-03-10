import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';

export default function TabTwoScreen() {
  const insets = useSafeAreaInsets();
  const markets = [
    { symbol: 'BTC', price: '$64,240', change: '+1.8%' },
    { symbol: 'ETH', price: '$3,480', change: '+1.2%' },
    { symbol: 'SOL', price: '$142', change: '+2.5%' },
  ];

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <DashboardHeader title="Markets" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-[#6B7280]">Live prices across major assets</Text>
        <View className="bg-white rounded-2xl p-4 gap-3 shadow-md">
          {markets.map((item) => (
            <View key={item.symbol} className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
              <View className="items-end">
                <Text className="text-sm font-bold text-[#111827]">{item.price}</Text>
                <Text className="text-xs font-semibold text-[#16A34A]">{item.change}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
