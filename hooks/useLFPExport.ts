// hooks/useLFPExport.tsx
import { useState } from 'react';
import { Alert } from 'react-native';
import { generateLFPPDFWithProgress, printLFPPDFWithProgress } from './usePDFGenerate';
import { Asset, Goal, PersonalFinancialPlan } from './useStore';

interface UseLFPExportOptions {
  personalFinancialPlan: PersonalFinancialPlan | null;
  currency?: string;
  language?: 'ru' | 'en' | 'kz';
  // Добавляем данные из приложения
  goals?: Goal[];
  incomes?: Asset[];
  actives?: Asset[];
  passives?: Asset[];
  appCurrency?: "₸" | "$" | "€";}




interface LoadingState {
  isVisible: boolean;
  status: 'generating' | 'sharing' | 'success' | 'error';
  message: string;
  progress: number;
}

export const useLFPExport = (options: UseLFPExportOptions) => {
  const { personalFinancialPlan, currency = '₸', language = 'ru' } = options;
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isVisible: false,
    status: 'generating',
    message: '',
    progress: 0
  });

  // Функция для обновления статуса загрузки
  const updateLoadingState = (updates: Partial<LoadingState>) => {
    setLoadingState(prev => ({ ...prev, ...updates }));
  };

  // Функция для закрытия модала
  const closeModal = () => {
    setLoadingState({
      isVisible: false,
      status: 'generating',
      message: '',
      progress: 0
    });
  };

  // Функция для генерации и сохранения PDF
  const exportToPDF = async () => {
    if (!personalFinancialPlan) {
      Alert.alert(
        'Данные не заполнены',
        'Пожалуйста, сначала заполните все поля Личного Финансового Плана',
        [{ text: 'OK' }]
      );
      return;
    }

    // Показываем модал загрузки
    setLoadingState({
      isVisible: true,
      status: 'generating',
      message: 'Инициализация процесса...',
      progress: 0
    });

    try {
      const success = await generateLFPPDFWithProgress({
        personalFinancialPlan,
        currency,
        language,
        onStatusChange: (status) => updateLoadingState({ status }),
        onProgressChange: (progress) => updateLoadingState({ progress }),
        onMessageChange: (message) => updateLoadingState({ message })
      });

      if (success) {
        // Показываем успех на 2 секунды, затем закрываем
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        // Показываем ошибку с кнопкой закрытия
        updateLoadingState({
          status: 'error',
          message: 'Не удалось создать PDF файл'
        });
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      updateLoadingState({
        status: 'error',
        message: 'Произошла непредвиденная ошибка'
      });
    }
  };

  // Функция для печати PDF
  const printPDF = async () => {
    if (!personalFinancialPlan) {
      Alert.alert(
        'Данные не заполнены',
        'Пожалуйста, сначала заполните все поля Личного Финансового Плана',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoadingState({
      isVisible: true,
      status: 'generating',
      message: 'Подготовка к печати...',
      progress: 0
    });

    try {
      const success = await printLFPPDFWithProgress({
        personalFinancialPlan,
        currency,
        language,
        onStatusChange: (status) => updateLoadingState({ status }),
        onProgressChange: (progress) => updateLoadingState({ progress }),
        onMessageChange: (message) => updateLoadingState({ message })
      });

      if (success) {
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        updateLoadingState({
          status: 'error',
          message: 'Не удалось отправить на печать'
        });
      }
    } catch (error) {
      console.error('Ошибка печати:', error);
      updateLoadingState({
        status: 'error',
        message: 'Произошла непредвиденная ошибка'
      });
    }
  };

  // Функция для показа меню выбора действия
  const showExportMenu = () => {
    if (!personalFinancialPlan) {
      Alert.alert(
        'Данные не заполнены',
        'Пожалуйста, сначала заполните все поля Личного Финансового Плана',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Экспорт ЛФП',
      'Выберите действие с документом',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: '📄 Сохранить PDF',
          onPress: exportToPDF
        },
        {
          text: '🖨️ Печать',
          onPress: printPDF
        }
      ]
    );
  };

  return {
    // Состояние
    loadingState,
    isDataAvailable: !!personalFinancialPlan,
    
    // Функции
    exportToPDF,
    printPDF,
    showExportMenu,
    closeModal,
    
    // Дополнительные утилиты
    updateLoadingState
  };
};

// Альтернативная функция для прямого использования без хука
export const exportLFPWithModal = async (
  personalFinancialPlan: PersonalFinancialPlan,
  options: {
    currency?: string;
    language?: 'ru' | 'en' | 'kz';
    onShowModal: (state: LoadingState) => void;
    onHideModal: () => void;
  }
) => {
  const { currency = '₸', language = 'ru', onShowModal, onHideModal } = options;

  // Показываем модал
  onShowModal({
    isVisible: true,
    status: 'generating',
    message: 'Инициализация процесса...',
    progress: 0
  });

  try {
    const success = await generateLFPPDFWithProgress({
      personalFinancialPlan,
      currency,
      language,
      onStatusChange: (status) => onShowModal({
        isVisible: true,
        status,
        message: '',
        progress: 0
      }),
      onProgressChange: (progress) => onShowModal({
        isVisible: true,
        status: 'generating',
        message: '',
        progress
      }),
      onMessageChange: (message) => onShowModal({
        isVisible: true,
        status: 'generating',
        message,
        progress: 0
      })
    });

    if (success) {
      onShowModal({
        isVisible: true,
        status: 'success',
        message: 'PDF файл успешно создан!',
        progress: 100
      });
      
      // Автоматически закрываем через 2 секунды
      setTimeout(() => {
        onHideModal();
      }, 2000);
    } else {
      onShowModal({
        isVisible: true,
        status: 'error',
        message: 'Не удалось создать PDF файл',
        progress: 0
      });
    }

    return success;
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    onShowModal({
      isVisible: true,
      status: 'error',
      message: 'Произошла непредвиденная ошибка',
      progress: 0
    });
    return false;
  }
};