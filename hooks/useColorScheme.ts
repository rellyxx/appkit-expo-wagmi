import { useAppearanceState } from '@/store/useAppearanceState';

export function useColorScheme() {
  return useAppearanceState((state) => state.themeMode);
}
