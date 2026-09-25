import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

/**
 * Возвращает текущее состояние подключения к сети.
 * isOnline === true, пока статус неизвестен (оптимистично), чтобы не блокировать UI на старте.
 */
/**
 * isInternetReachable может быть null, пока проверка не завершена — считаем это онлайном.
 * В вебе эту проверку не учитываем: NetInfo делает её HEAD-запросом к самому
 * сайту, и медленный ответ dev-сервера выглядел как «нет интернета». Там
 * достаточно флага браузера (isConnected = navigator.onLine).
 */
const isReachable = (state: NetInfoState) =>
  state.isConnected === true && (Platform.OS === 'web' || state.isInternetReachable !== false);

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(isReachable(state));
    });

    // Первичная проверка
    NetInfo.fetch().then((state) => {
      setIsOnline(isReachable(state));
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
};

export default useNetworkStatus;
