import React from 'react';
import { Text, View, Image } from 'react-native';
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
        <View className="flex-row items-center gap-1">
          <View className="h-9 w-9 items-center justify-center">
             <Image
                source={require('@/assets/images/logo.png')}
                className="h-10"
                resizeMode="contain"
              />
          </View>
          <Text className="text-xl font-bold text-black">OpenFi</Text>
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
