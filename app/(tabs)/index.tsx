import '@walletconnect/react-native-compat';
import { AppKitButton, solana } from '@reown/appkit-react-native';
import { ModalController, PublicStateController } from '@reown/appkit-core-react-native';
import { Image } from 'expo-image';
import React from 'react';
import { View, Text, Pressable } from 'react-native';

import { MobileWave } from '@/components/MobileWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import ReownFigures from '@/components/ReownFigures';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WalletInfoView } from '@/components/WalletInfoView';
import { reownDarkGray, reownOrange } from '@/constants/Colors';

export default function HomeScreen() {
  const onPressConnectSolana = () => {
    PublicStateController.set({ selectedNetworkId: solana.caipNetworkId });
    ModalController.open({ view: 'Connect' });
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: reownDarkGray, dark: reownDarkGray }}
        headerImage={
          <View className="flex-1 flex-row justify-center items-center p-4">
            <View className="flex-col w-1/2 h-full justify-end gap-2.5">
              <Image
                source={require('@/assets/images/reown-logo.png')}
                style={{ height: 48, width: 180 }}
              />
              <Text className="font-[KHTekaMono] text-sm leading-6 font-semibold text-white">
                Powering the future of the financial internet
              </Text>
            </View>
            <ReownFigures />
          </View>
        }>
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <ThemedText type="title">AppKit</ThemedText>
          <ThemedText type="subtitle">for React Native</ThemedText>
          <MobileWave />
        </ThemedView>
        <WalletInfoView />

        <View className="mt-5 justify-center items-center">
          <AppKitButton connectStyle={{ marginTop: 20, backgroundColor: reownOrange }} label='连接 EVM 钱包' />
          <Pressable onPress={onPressConnectSolana} className="mt-3 py-3 px-4 bg-[#14F195] rounded-xl">
            <Text className="text-base text-center text-red-500 font-bold">连接 Solana 钱包</Text>
          </Pressable>
        </View>
      </ParallaxScrollView>
    </>
  );
}
