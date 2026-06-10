import React, { useEffect, useRef } from 'react';
import {
  syncUserDataToServer,
  fetchUserDataFromServer,
} from '@/services/api';
import useFinancialStore from './useStore';
import type { AppState } from './store/types';
import { useNetworkStatus } from './useNetworkStatus';
import {
  SYNC_THROTTLE_MS,
  SYNC_DEBOUNCE_MS,
  coerceTheme,
  coerceLanguage,
  coerceCurrency,
  syncSignature,
  hasSyncableData,
} from '@/constants/sync';

/** Извлекает только синхронизируемые поля из состояния стора. */
const extractSyncable = (s: AppState) => ({
  categories: s.categories,
  wallets: s.wallets,
  expences: s.expences,
  incomes: s.incomes,
  actives: s.actives,
  passives: s.passives,
  goals: s.goals,
  personalFinancialPlan: s.personalFinancialPlan,
  theme: s.theme,
  language: s.language,
  currency: s.currency,
});

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

        // Оцениваем локальное состояние ДО применения серверных данных.
        const local = extractSyncable(useFinancialStore.getState());
        const localSig = syncSignature(local);
        const lastHash = useFinancialStore.getState().lastSyncHash;
        // «Грязно» = локальные данные изменились с последней успешной синхры
        // (или синхры ещё не было). Тогда есть риск затереть несохранённые правки.
        const localDirty = lastHash === null || localSig !== lastHash;
        const localHasData = hasSyncableData(local);

        if (!serverData) {
          // Данных на сервере нет — отправляем текущие локальные.
          console.log('Данные пользователя не найдены на сервере');
          syncInProgress.current = false;
          setIsSyncing(false);
          await syncToServer();
          return;
        }

        if (localDirty && localHasData) {
          // На устройстве есть несинхронизированные правки — НЕ затираем их
          // серверной версией, а отправляем локальные данные на сервер.
          console.log('Обнаружены несинхронизированные локальные изменения — отправляем на сервер');
          syncInProgress.current = false;
          setIsSyncing(false);
          await syncToServer();
          return;
        }

        // Локальные данные синхронизированы (или пусты) — принимаем серверные.
        if (serverData.categories) store.setCategories(serverData.categories);
        if (serverData.wallets) store.setWallets(serverData.wallets);

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

        // Фиксируем подпись принятых данных, чтобы дальше корректно определять
        // локальные изменения и не перезаписывать сервер на каждом запуске.
        useFinancialStore.getState().setLastSyncHash(
          syncSignature(extractSyncable(useFinancialStore.getState()))
        );

        console.log('Данные успешно загружены с сервера');
        setSyncError(null);
        setStatus('success');
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
      // Берём актуальный снимок из стора (а не из устаревшего замыкания рендера)
      // и из него же считаем подпись — это гарантирует, что подпись соответствует
      // ровно тем данным, что ушли на сервер.
      const snapshot = extractSyncable(useFinancialStore.getState());
      await syncUserDataToServer(store.user.id, snapshot);
      useFinancialStore.getState().setLastSyncHash(syncSignature(snapshot));
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
