import AsyncStorage from '@react-native-async-storage/async-storage';

import {safeJsonParse, safeJsonStringify} from '@walletconnect/safe-json';
import {type Storage} from '@reown/appkit-react-native';

const isSSR = typeof window === 'undefined';
const memoryStore = new Map<string, string>();

export const storage: Storage = {
  getKeys: async () => {
    if (isSSR) {
      return Array.from(memoryStore.keys());
    }
    return await AsyncStorage.getAllKeys() as string[];
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    if (isSSR) {
      return Array.from(memoryStore.entries()).map(([key, value]) => [key, safeJsonParse(value) as T]);
    }
    const keys = await AsyncStorage.getAllKeys();
    return await Promise.all(keys.map(async key => [
      key,
      safeJsonParse(await AsyncStorage.getItem(key) ?? '') as T,
    ]));
  },
  setItem: async <T = any>(key: string, value: T) => {
    if (isSSR) {
      memoryStore.set(key, safeJsonStringify(value));
      return;
    }
    await AsyncStorage.setItem(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    if (isSSR) {
      const item = memoryStore.get(key);
      if (typeof item === 'undefined' || item === null) {
        return undefined;
      }
      return safeJsonParse(item) as T;
    }
    const item = await AsyncStorage.getItem(key);
    if (typeof item === 'undefined' || item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    if (isSSR) {
      memoryStore.delete(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};
