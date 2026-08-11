import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import useFinancialStore from '@/hooks/useStore';

/**
 * Экран ошибки вынесен в отдельный функциональный компонент: сам ErrorBoundary —
 * классовый и хуки использовать не может, а тему нужно читать из стора.
 */
const DefaultErrorFallback: React.FC<{ error: Error; onReset: () => void }> = ({
  error,
  onReset,
}) => {
  // Ошибка могла прийти как раз из стора, поэтому подстраховываемся тёмной темой.
  let isDark = true;
  try {
    isDark = useFinancialStore((s) => s.theme) !== 'light';
  } catch {
    isDark = true;
  }

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const titleColor = isDark ? 'text-white' : 'text-gray-900';
  const textColor = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <View className={`flex-1 items-center justify-center px-6 ${bgColor}`}>
      <Text className={`${titleColor} text-xl font-['SFProDisplaySemiBold'] mb-3 text-center`}>
        Что-то пошло не так
      </Text>
      <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] mb-6 text-center`}>
        Произошла непредвиденная ошибка. Попробуйте ещё раз.
      </Text>

      {__DEV__ && (
        <ScrollView className="max-h-40 mb-6 w-full">
          <Text className={`${isDark ? 'text-red-400' : 'text-red-600'} text-xs font-mono`}>
            {error.message}
          </Text>
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={onReset}
        className="bg-[#4CAF50] rounded-xl px-8 py-3"
        activeOpacity={0.8}
      >
        <Text className="text-white text-base font-['SFProDisplaySemiBold']">
          Попробовать снова
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface Props {
  children: React.ReactNode;
  /** Опциональный кастомный fallback */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Перехватывает ошибки рендера в дочернем дереве, чтобы приложение
 * не падало с белым/чёрным экраном, а показывало понятный экран с возможностью повтора.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return <DefaultErrorFallback error={this.state.error} onReset={this.reset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
