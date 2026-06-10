import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Веб-вариант хранилища для persist-слоя стора.
 *
 * На вебе нет нативных модулей expo-secure-store / expo-crypto (и шифрование
 * локального хранилища здесь не применяется — веб не целевая платформа), поэтому
 * используется обычный AsyncStorage. Metro автоматически подставляет этот файл
 * вместо `secureStorage.ts` при сборке под web, благодаря расширению `.web.ts`,
 * так что нативные модули в веб-бандл не попадают.
 */
export const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error('secureStorage.getItem error:', error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('secureStorage.setItem error:', error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('secureStorage.removeItem error:', error);
    }
  },
};
