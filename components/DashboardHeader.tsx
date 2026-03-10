import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppKitButton } from '@reown/appkit-react-native';

type Props = {
  title: string;
};

export const DASHBOARD_HEADER_HEIGHT = 70;

export function DashboardHeader({ title }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute top-0 left-0 right-0 z-10 bg-[#F4F6FB] px-5 pb-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 rounded-[10px] bg-[#E7EEFF] items-center justify-center">
            <View className="h-4 w-4 rounded bg-transparent border-2 border-[#2F6DF6]" />
          </View>
          <Text className="text-lg font-bold text-[#111827]">{title}</Text>
        </View>
        <AppKitButton
          label="Connect Wallet"
          connectStyle={{
            paddingHorizontal: 12,
            height: 36,
            borderRadius: 12,
            backgroundColor: '#EEF3FF',
          }}
        />
      </View>
    </View>
  );
}
