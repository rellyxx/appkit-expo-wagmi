import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';
import { useAppearanceState } from '@/store/useAppearanceState';
import { AppTheme } from '@/constants/AppTheme';

export default function TabTwoScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useAppearanceState((state) => state.themeMode);
  const colors = themeMode === 'dark' ? AppTheme.dark : AppTheme.light;
  const markets = [
    { symbol: 'BTC', price: '$64,240', change: '+1.8%' },
    { symbol: 'ETH', price: '$3,480', change: '+1.2%' },
    { symbol: 'SOL', price: '$142', change: '+2.5%' },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.pageBg }}>
      <DashboardHeader title="Markets" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Live prices across major assets</Text>
        <View className="rounded-2xl p-4 gap-3 shadow-md" style={{ backgroundColor: colors.cardBg }}>
          {markets.map((item) => (
            <View key={item.symbol} className="flex-row items-center justify-between">
              <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>{item.symbol}</Text>
              <View className="items-end">
                <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>{item.price}</Text>
                <Text className="text-xs font-semibold" style={{ color: colors.success }}>{item.change}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
