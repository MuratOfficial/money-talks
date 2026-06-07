import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

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

      return (
        <View className="flex-1 items-center justify-center bg-black px-6">
          <Text className="text-white text-xl font-['SFProDisplaySemiBold'] mb-3 text-center">
            Что-то пошло не так
          </Text>
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-6 text-center">
            Произошла непредвиденная ошибка. Попробуйте ещё раз.
          </Text>

          {__DEV__ && (
            <ScrollView className="max-h-40 mb-6 w-full">
              <Text className="text-red-400 text-xs font-mono">
                {this.state.error.message}
              </Text>
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={this.reset}
            className="bg-[#4CAF50] rounded-xl px-8 py-3"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">
              Попробовать снова
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
