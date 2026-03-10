import '@walletconnect/react-native-compat';
import React from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardHeader, DASHBOARD_HEADER_HEIGHT } from '@/components/DashboardHeader';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const swipeHandledRef = React.useRef(false);

  const deposits = [
    {
      symbol: 'USDC',
      amount: '500.00 USDC',
      apy: '4.2%',
      value: '$500.00',
      color: '#3B82F6',
      icon: '$',
    },
    {
      symbol: 'WETH',
      amount: '0.50 WETH',
      apy: '3.8%',
      value: '$1,250.00',
      color: '#A855F7',
      icon: 'Ξ',
    },
    {
      symbol: 'USDT',
      amount: '0.50 USDT',
      apy: '3.8%',
      value: '$1,250.00',
      color: '#A855F7',
      icon: 'Ξ',
    },
    {
      symbol: 'BNB',
      amount: '0.50 BNB',
      apy: '3.8%',
      value: '$1,250.00',
      color: '#A855F7',
      icon: 'Ξ',
    },
     {
      symbol: 'BTC',
      amount: '0.50 BTC',
      apy: '3.8%',
      value: '$1,250.00',
      color: '#A855F7',
      icon: 'Ξ',
    },
  ];

  const availableToDeposit = [
    {
      symbol: 'USDC',
      amount: 'Wallet: 1,240.50 USDC',
      color: '#3B82F6',
      icon: '$',
    },
    {
      symbol: 'WETH',
      amount: 'Wallet: 1.24 WETH',
      color: '#A855F7',
      icon: 'Ξ',
    },
  ];

  const borrows = [
    {
      symbol: 'USDT',
      amount: '150.00 USDT',
      apr: '6.1%',
      value: '$150.00',
      color: '#F97316',
      icon: '$',
    },
    {
      symbol: 'WBTC',
      amount: '0.08 WBTC',
      apr: '5.4%',
      value: '$520.00',
      color: '#F59E0B',
      icon: '₿',
    },
  ];

  const availableToBorrow = [
    {
      symbol: 'USDC',
      amount: 'Borrow limit: 2,400.00 USDC',
      color: '#3B82F6',
      icon: '$',
    },
    {
      symbol: 'WETH',
      amount: 'Borrow limit: 0.90 WETH',
      color: '#A855F7',
      icon: 'Ξ',
    },
  ];

  const pageWidth = contentWidth || Math.max(windowWidth - 40, 0);

  const handleTabPress = React.useCallback((index: number) => {
    setActiveTab(index);
    if (pageWidth > 0) {
      scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    }
  }, [pageWidth]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 && Math.abs(gesture.dy) < 6,
        onPanResponderMove: (_, gesture) => {
          if (swipeHandledRef.current) return;
          if (gesture.dx > 6 && activeTab !== 0) {
            swipeHandledRef.current = true;
            handleTabPress(0);
          }
          if (gesture.dx < -6 && activeTab !== 1) {
            swipeHandledRef.current = true;
            handleTabPress(1);
          }
        },
        onPanResponderRelease: () => {
          swipeHandledRef.current = false;
        },
        onPanResponderTerminate: () => {
          swipeHandledRef.current = false;
        },
      }),
    [activeTab, handleTabPress],
  );

  return (
    <View className="flex-1 bg-[#F4F6FB]">
      <DashboardHeader title="Dashboard" />
      <ScrollView
        contentContainerClassName="px-5 pb-28 gap-4"
        contentContainerStyle={{ paddingTop: insets.top + DASHBOARD_HEADER_HEIGHT }}
        scrollIndicatorInsets={{ top: insets.top + DASHBOARD_HEADER_HEIGHT }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >

        <View className="bg-[#2F6DF6] rounded-[20px] p-5 gap-2 shadow-lg">
          <Text className="text-sm font-semibold text-[#D6E4FF]">Net Worth</Text>
          <View className="self-start rounded-full bg-white/20 px-2.5 py-1.5">
            <Text className="text-xs font-semibold text-white">↗  +2.4% vs last week</Text>
          </View>
        </View>

        <View className="flex-row border-b border-[#E5E7EB]">
          <Pressable
            className={`flex-1 items-center py-3 border-b-2 ${activeTab === 0 ? 'border-[#2F6DF6]' : 'border-transparent'}`}
            onPress={() => handleTabPress(0)}
          >
            <Text className={`text-sm ${activeTab === 0 ? 'font-bold text-[#2F6DF6]' : 'font-semibold text-[#6B7280]'}`}>
              Deposit
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 items-center py-3 border-b-2 ${activeTab === 1 ? 'border-[#2F6DF6]' : 'border-transparent'}`}
            onPress={() => handleTabPress(1)}
          >
            <Text className={`text-sm ${activeTab === 1 ? 'font-bold text-[#2F6DF6]' : 'font-semibold text-[#6B7280]'}`}>
              Borrow
            </Text>
          </Pressable>
        </View>

        <View
          onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
          className="mt-1"
          {...panResponder.panHandlers}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ width: pageWidth * 2 }}
          >
            <View style={{ width: pageWidth }} className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-[#111827]">My Deposits</Text>
                <Text className="text-xs font-semibold text-[#9CA3AF]">APY (%)</Text>
              </View>

              {deposits.map((item) => (
                <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                      <Text className="text-lg font-bold" style={{ color: item.color }}>{item.icon}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
                      <Text className="text-[13px] text-[#6B7280] mt-0.5">{item.amount}</Text>
                    </View>
                  </View>
                  <View className="items-end gap-1">
                    <Text className="text-sm font-bold text-[#16A34A]">{item.apy}</Text>
                    <Text className="text-[13px] text-[#6B7280]">{item.value}</Text>
                  </View>
                </View>
              ))}

              <Text className="mt-1.5 text-base font-bold text-[#111827]">Available to Deposit</Text>

              {availableToDeposit.map((item) => (
                <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                      <Text className="text-lg font-bold" style={{ color: item.color }}>{item.icon}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
                      <Text className="text-[13px] text-[#6B7280] mt-0.5">{item.amount}</Text>
                    </View>
                  </View>
                  <Pressable className="bg-[#2F6DF6] px-4 py-2 rounded-xl">
                    <Text className="text-[13px] font-bold text-white">Deposit</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={{ width: pageWidth }} className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-[#111827]">My Borrows</Text>
                <Text className="text-xs font-semibold text-[#9CA3AF]">APR (%)</Text>
              </View>

              {borrows.map((item) => (
                <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                      <Text className="text-lg font-bold" style={{ color: item.color }}>{item.icon}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
                      <Text className="text-[13px] text-[#6B7280] mt-0.5">{item.amount}</Text>
                    </View>
                  </View>
                  <View className="items-end gap-1">
                    <Text className="text-sm font-bold text-[#DC2626]">{item.apr}</Text>
                    <Text className="text-[13px] text-[#6B7280]">{item.value}</Text>
                  </View>
                </View>
              ))}

              <Text className="mt-1.5 text-base font-bold text-[#111827]">Available to Borrow</Text>

              {availableToBorrow.map((item) => (
                <View key={item.symbol} className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-md">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 rounded-full items-center justify-center" style={{ backgroundColor: `${item.color}22` }}>
                      <Text className="text-lg font-bold" style={{ color: item.color }}>{item.icon}</Text>
                    </View>
                    <View>
                      <Text className="text-base font-bold text-[#111827]">{item.symbol}</Text>
                      <Text className="text-[13px] text-[#6B7280] mt-0.5">{item.amount}</Text>
                    </View>
                  </View>
                  <Pressable className="bg-[#2F6DF6] px-4 py-2 rounded-xl">
                    <Text className="text-[13px] font-bold text-white">Borrow</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
