import React, { useEffect, useRef } from 'react';
import { 
  syncUserDataToServer, 
  fetchUserDataFromServer,
  UserData 
} from '@/services/api';
import useFinancialStore from './useStore';

/**
 * Хук для автоматической синхронизации данных с сервером
 */
export const useSync = () => {
  const store = useFinancialStore();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef<number>(0);
  const hasLoadedInitialData = useRef(false);

  // Загрузка данных с сервера при запуске приложения
  useEffect(() => {
    const loadDataFromServer = async () => {
      if (!store.user?.id || syncInProgress.current) return;

      syncInProgress.current = true;
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
            theme: serverData.theme as any || 'dark',
            language: serverData.language as any || 'ru',
            currency: serverData.currency as any || '₸',
          });

          console.log('Данные успешно загружены с сервера');
        } else {
          console.log('Данные пользователя не найдены на сервере');
          // Если данных нет на сервере, отправим текущие данные
          await syncToServer();
        }
      } catch (error) {
        console.error('Ошибка загрузки данных с сервера:', error);
      } finally {
        syncInProgress.current = false;
      }
    };

    if (store.isAuthenticated && store.user?.id) {
      loadDataFromServer();
    }
  }, [store.isAuthenticated, store.user?.id]);

  // Функция для отправки данных на сервер
  const syncToServer = async () => {
    if (!store.user?.id || syncInProgress.current) return;

    // Throttling: не чаще раза в 5 секунд
    const now = Date.now();
    if (now - lastSyncTime.current < 5000) {
      return;
    }

    syncInProgress.current = true;
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
    } catch (error) {
      console.error('Ошибка отправки данных на сервер:', error);
    } finally {
      syncInProgress.current = false;
    }
  };

  // Автоматическая синхронизация при изменении важных данных
  useEffect(() => {
    if (!store.isAuthenticated || !store.user?.id) return;

    // Debounce: отправляем данные через 2 секунды после последнего изменения
    const timeoutId = setTimeout(() => {
      syncToServer();
    }, 2000);

    return () => clearTimeout(timeoutId);
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

  return {
    syncToServer,
    isSyncing: syncInProgress.current,
  };
};

export default useSync;