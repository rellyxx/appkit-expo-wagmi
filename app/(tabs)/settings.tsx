import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';
import { useAppearanceState } from '@/store/useAppearanceState';
import { AppTheme } from '@/constants/AppTheme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const themeMode = useAppearanceState((state) => state.themeMode);
  const toggleThemeMode = useAppearanceState((state) => state.toggleThemeMode);
  const isDark = themeMode === 'dark';
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  const pageBg = colors.pageBg;
  const cardBg = colors.cardBg;
  const titleColor = colors.textPrimary;
  const subtitleColor = colors.textMuted;
  const hintColor = colors.textSecondary;
  const switchTrackColor = { false: '#CBD5E1', true: '#A78BFA' };
  const switchThumbColor = isDark ? '#E2E8F0' : '#FFFFFF';

  return (
    <View className="flex-1" style={{ backgroundColor: pageBg }}>
      <DashboardHeader title="Settings" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold" style={{ color: hintColor }}>Manage your preferences</Text>
        <View className="mt-2 rounded-[20px] p-4 gap-5 shadow-md" style={{ backgroundColor: cardBg }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-bold" style={{ color: titleColor }}>Dark Mode</Text>
              <Text className="text-xs mt-1" style={{ color: subtitleColor }}>Switch between light and dark appearance</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => void toggleThemeMode()}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-bold" style={{ color: titleColor }}>Push Notifications</Text>
              <Text className="text-xs mt-1" style={{ color: subtitleColor }}>Price alerts and updates</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-bold" style={{ color: titleColor }}>Biometric Unlock</Text>
              <Text className="text-xs mt-1" style={{ color: subtitleColor }}>Use Face ID or Touch ID</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-bold" style={{ color: titleColor }}>Analytics</Text>
              <Text className="text-xs mt-1" style={{ color: subtitleColor }}>Share usage data</Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
