import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useAppearanceState } from '@/store/useAppearanceState';

export default function BlurTabBarBackground() {
  const themeMode = useAppearanceState((state) => state.themeMode);
  const tint = themeMode === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';

  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint={tint}
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
