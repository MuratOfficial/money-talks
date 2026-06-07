import React, { useEffect, useRef } from 'react';
import {
  syncUserDataToServer,
  fetchUserDataFromServer,
} from '@/services/api';
import useFinancialStore from './useStore';
import { useNetworkStatus } from './useNetworkStatus';
import {
  SYNC_THROTTLE_MS,
  SYNC_DEBOUNCE_MS,
  coerceTheme,
  coerceLanguage,
  coerceCurrency,
} from '@/constants/sync';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * Хук для автоматической синхронизации данных с сервером
 */
export const useSync = () => {
  const store = useFinancialStore();
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<SyncStatus>('idle');
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef<number>(0);

  // Актуальное состояние сети для использования внутри замыканий эффектов
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;

  // Загрузка данных с сервера при запуске приложения
  useEffect(() => {
    const loadDataFromServer = async () => {
      if (!store.user?.id || syncInProgress.current || !isOnlineRef.current) return;

      syncInProgress.current = true;
      setIsSyncing(true);
      setStatus('syncing');
      try {
        console.log('Загрузка данных с сервера...');
        const serverData = await fetchUserDataFromServer(store.user.id);

        if (serverData) {
          // Обновляем store данными с сервера
          if (serverData.categories) store.setCategories(serverData.categories);
          if (serverData.wallets) store.setWallets(serverData.wallets);

          // Обновляем остальные данные через set
          useFinancialStore.setState({
            expences: serverData.expences || [],
            incomes: serverData.incomes || [],
            actives: serverData.actives || [],
            passives: serverData.passives || [],
            goals: serverData.goals || [],
            personalFinancialPlan: serverData.personalFinancialPlan || null,
            theme: coerceTheme(serverData.theme),
            language: coerceLanguage(serverData.language),
            currency: coerceCurrency(serverData.currency),
          });

          console.log('Данные успешно загружены с сервера');
          setSyncError(null);
          setStatus('success');
        } else {
          console.log('Данные пользователя не найдены на сервере');
          // Если данных нет на сервере, отправим текущие данные
          syncInProgress.current = false;
          setIsSyncing(false);
          await syncToServer();
          return;
        }
      } catch (error) {
        console.error('Ошибка загрузки данных с сервера:', error);
        setSyncError('Не удалось загрузить данные с сервера');
        setStatus('error');
      } finally {
        syncInProgress.current = false;
        setIsSyncing(false);
      }
    };

    if (store.isAuthenticated && store.user?.id) {
      loadDataFromServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isAuthenticated, store.user?.id]);

  // Функция для отправки данных на сервер
  const syncToServer = async () => {
    if (!store.user?.id || syncInProgress.current) return;

    // Не пытаемся синхронизироваться без сети — данные сохранены локально
    if (!isOnlineRef.current) {
      console.log('Оффлайн — синхронизация отложена');
      return;
    }

    // Throttling: не чаще одного раза в SYNC_THROTTLE_MS
    const now = Date.now();
    if (now - lastSyncTime.current < SYNC_THROTTLE_MS) {
      return;
    }

    syncInProgress.current = true;
    setIsSyncing(true);
    setStatus('syncing');
    lastSyncTime.current = now;

    try {
      console.log('Отправка данных на сервер...');
      await syncUserDataToServer(store.user.id, {
        categories: store.categories,
        wallets: store.wallets,
        expences: store.expences,
        incomes: store.incomes,
        actives: store.actives,
        passives: store.passives,
        goals: store.goals,
        personalFinancialPlan: store.personalFinancialPlan,
        theme: store.theme,
        language: store.language,
        currency: store.currency,
      });
      console.log('Данные успешно отправлены на сервер');
      setSyncError(null);
      setStatus('success');
    } catch (error) {
      console.error('Ошибка отправки данных на сервер:', error);
      setSyncError('Не удалось сохранить данные на сервере');
      setStatus('error');
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  };

  // Автоматическая синхронизация при изменении важных данных
  useEffect(() => {
    if (!store.isAuthenticated || !store.user?.id) return;

    // Debounce: отправляем данные через SYNC_DEBOUNCE_MS после последнего изменения
    const timeoutId = setTimeout(() => {
      syncToServer();
    }, SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.categories,
    store.wallets,
    store.expences,
    store.incomes,
    store.actives,
    store.passives,
    store.goals,
    store.personalFinancialPlan,
  ]);

  // При восстановлении сети пробуем досинхронизировать локальные изменения
  useEffect(() => {
    if (isOnline && store.isAuthenticated && store.user?.id) {
      syncToServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return {
    syncToServer,
    isSyncing,
    syncError,
    status,
    isOnline,
    clearSyncError: () => setSyncError(null),
  };
};

export default useSync;
