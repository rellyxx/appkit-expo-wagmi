import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';
import { themeColor } from '@/constants/Colors';
import { useAppearanceState } from '@/store/useAppearanceState';
import { AppTheme } from '@/constants/AppTheme';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useAppearanceState((state) => state.themeMode);
  const colors = themeMode === 'dark' ? AppTheme.dark : AppTheme.light;
  const items = [
    { id: '1', title: 'Deposit USDC', time: 'Today, 09:24', amount: '+$500.00' },
    { id: '2', title: 'Swap to WETH', time: 'Yesterday, 18:10', amount: '-$320.40' },
    { id: '3', title: 'Borrow USDC', time: 'Mar 06, 14:02', amount: '+$750.00' },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.pageBg }}>
      <DashboardHeader title="History" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Recent activity</Text>
        <View className="mt-2 rounded-[20px] p-4 gap-3 shadow-md" style={{ backgroundColor: colors.cardBg }}>
          {items.map((item) => (
            <View key={item.id} className="flex-row items-center justify-between">
              <View>
                <Text className="text-[15px] font-bold" style={{ color: colors.textPrimary }}>{item.title}</Text>
                <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{item.time}</Text>
              </View>
              <Text className="text-sm font-bold" style={{ color: themeColor }}>{item.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
