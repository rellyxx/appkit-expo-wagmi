import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';
import { themeColor } from '@/constants/Colors';
import { useAppearanceState } from '@/store/useAppearanceState';
import { AppTheme } from '@/constants/AppTheme';

export default function TransferScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useAppearanceState((state) => state.themeMode);
  const colors = themeMode === 'dark' ? AppTheme.dark : AppTheme.light;
  const [fromAmount, setFromAmount] = useState('0.0');
  const [toAmount, setToAmount] = useState('0.0');

  return (
    <View className="flex-1" style={{ backgroundColor: colors.pageBg }}>
      <DashboardHeader title="Swap" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Exchange assets instantly</Text>

        <View className="mt-2 rounded-[20px] p-4 gap-4 shadow-md" style={{ backgroundColor: colors.cardBg }}>
          <View className="gap-2">
            <Text className="text-[13px] font-bold" style={{ color: colors.textSecondary }}>From</Text>
            <View className="flex-row items-center justify-between rounded-[14px] px-3 py-3" style={{ backgroundColor: colors.cardAltBg }}>
              <Text className="text-sm font-bold" style={{ color: themeColor }}>USDC</Text>
              <TextInput
                value={fromAmount}
                onChangeText={setFromAmount}
                keyboardType="decimal-pad"
                className="text-base font-bold min-w-[80px] text-right"
                style={{ color: colors.textPrimary }}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <Text className="text-xs font-semibold" style={{ color: colors.textMuted }}>Balance: 1,240.50 USDC</Text>
          </View>

          <View className="h-px" style={{ backgroundColor: colors.border }} />

          <View className="gap-2">
            <Text className="text-[13px] font-bold" style={{ color: colors.textSecondary }}>To</Text>
            <View className="flex-row items-center justify-between rounded-[14px] px-3 py-3" style={{ backgroundColor: colors.cardAltBg }}>
              <Text className="text-sm font-bold" style={{ color: colors.purple }}>WETH</Text>
              <TextInput
                value={toAmount}
                onChangeText={setToAmount}
                keyboardType="decimal-pad"
                className="text-base font-bold min-w-[80px] text-right"
                style={{ color: colors.textPrimary }}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <Text className="text-xs font-semibold" style={{ color: colors.textMuted }}>Rate: 1 USDC ≈ 0.00031 WETH</Text>
          </View>

          <Pressable className="py-3 rounded-[14px] items-center" style={{ backgroundColor: themeColor }}>
            <Text className="text-[15px] font-bold text-white">Swap Now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
