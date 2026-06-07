import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Возвращает текущее состояние подключения к сети.
 * isOnline === true, пока статус неизвестен (оптимистично), чтобы не блокировать UI на старте.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable может быть null, пока проверка не завершена — считаем это онлайном
      const reachable =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(reachable);
    });

    // Первичная проверка
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline };
};

export default useNetworkStatus;
