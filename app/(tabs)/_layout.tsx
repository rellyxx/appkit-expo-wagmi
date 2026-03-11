import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { themeColor } from '@/constants/Colors';
import { useChainId } from 'wagmi';
import { useGlobalState } from '@/store/useGlobalState';
import { useAppearanceState } from '@/store/useAppearanceState';
import { AppTheme } from '@/constants/AppTheme';
export default function TabLayout() {
  const chainId = useChainId();
  const themeMode = useAppearanceState((state) => state.themeMode);
  const isDark = themeMode === 'dark';
  const colors = isDark ? AppTheme.dark : AppTheme.light;
  const { fetchReserves, setChainId } = useGlobalState();
  useEffect(() => {
    if (typeof chainId === 'number') {
      setChainId(chainId);
    }
    fetchReserves(); 
  }, [chainId, fetchReserves, setChainId]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColor,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.border,
          },
          default: {
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.border,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Markets',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: 'Swap',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="arrow.left.arrow.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock.arrow.circlepath" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
