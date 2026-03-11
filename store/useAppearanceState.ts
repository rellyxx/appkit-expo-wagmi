import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

type AppearanceState = {
  themeMode: ThemeMode;
  initialized: boolean;
  initializeTheme: () => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  toggleThemeMode: () => Promise<void>;
};

const THEME_MODE_STORAGE_KEY = 'openfi.themeMode';

export const useAppearanceState = create<AppearanceState>((set, get) => ({
  themeMode: 'light',
  initialized: false,
  initializeTheme: async () => {
    if (get().initialized) return;
    try {
      const saved = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        set({ themeMode: saved, initialized: true });
        return;
      }
    } catch {}
    set({ initialized: true });
  },
  setThemeMode: async (themeMode) => {
    set({ themeMode });
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, themeMode);
    } catch {}
  },
  toggleThemeMode: async () => {
    const nextMode: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
    set({ themeMode: nextMode });
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    } catch {}
  },
}));
