import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <DashboardHeader title="Settings" />
      <ScrollView
        contentContainerClassName="px-5 gap-3"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm font-semibold text-[#6B7280]">Manage your preferences</Text>
        <View className="mt-2 bg-white rounded-[20px] p-4 gap-5 shadow-md">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-bold text-[#111827]">Push Notifications</Text>
              <Text className="text-xs text-[#9CA3AF] mt-1">Price alerts and updates</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-bold text-[#111827]">Biometric Unlock</Text>
              <Text className="text-xs text-[#9CA3AF] mt-1">Use Face ID or Touch ID</Text>
            </View>
            <Switch value={biometrics} onValueChange={setBiometrics} />
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-bold text-[#111827]">Analytics</Text>
              <Text className="text-xs text-[#9CA3AF] mt-1">Share usage data</Text>
            </View>
            <Switch value={analytics} onValueChange={setAnalytics} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
