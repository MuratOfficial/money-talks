import { supabase } from '@/lib/supabase';
import { deleteUserDataFromServer } from '@/services/api';
import {
  AppState,
  AuthResponse,
  SliceCreator,
  UpdatePasswordParams,
  User,
  VerifyOtpParams,
} from './types';

type AuthSlice = Pick<
  AppState,
  | 'user'
  | 'isAuthenticated'
  | 'isLoading'
  | 'setUser'
  | 'logout'
  | 'setLoading'
  | 'updateUserProfile'
  | 'signUp'
  | 'signIn'
  | 'signOut'
  | 'deleteAccount'
  | 'resetPassword'
  | 'verifyOtp'
  | 'updatePassword'
  | 'verifyResetCode'
>;

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  logout: () => set({ user: null, isAuthenticated: false }),

  setLoading: (isLoading) => set({ isLoading }),

  signUp: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: name,
          avatar: null,
        };

        set({ user, isAuthenticated: true });
        return { success: true };
      }

      return { success: false, error: 'Не удалось создать пользователя' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name || data.user.email!,
          avatar: profile?.avatar || null,
          riskProfile: profile?.risk_profile,
        };

        set({ user, isAuthenticated: true });
        return { success: true };
      }

      return { success: false, error: 'Не удалось войти' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        goals: [],
        categories: [],
        wallets: [],
        personalFinancialPlan: null,
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) return { success: false, error: 'Пользователь не найден' };

    try {
      // 1. Удаляем данные пользователя с сервера (бюджет, цели, ЛФП и т.д.).
      try {
        await deleteUserDataFromServer(user.id);
      } catch (e) {
        // Если данных на сервере не было — продолжаем удаление аккаунта.
        console.warn('deleteAccount: не удалось удалить данные с сервера', e);
      }

      // 2. Удаляем сам аккаунт через серверный RPC (требует прав admin на бэкенде).
      //    Функцию delete_user нужно создать в Supabase (SECURITY DEFINER).
      const { error: rpcError } = await supabase.rpc('delete_user');
      if (rpcError) {
        console.warn('deleteAccount: RPC delete_user недоступен', rpcError.message);
      }

      // 3. Завершаем сессию и очищаем локальное состояние в любом случае.
      await supabase.auth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        goals: [],
        categories: [],
        wallets: [],
        personalFinancialPlan: null,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Ошибка при удалении аккаунта:', error);
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        console.error('Ошибка отправки кода:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Ошибка resetPassword:', error);
      return { success: false, error: error.message || 'Произошла неизвестная ошибка' };
    }
  },

  verifyOtp: async ({ email, token, type }: VerifyOtpParams): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type });

      if (error) {
        console.error('Ошибка проверки OTP:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Ошибка verifyOtp:', error);
      return { success: false, error: error.message || 'Произошла неизвестная ошибка' };
    }
  },

  updatePassword: async ({ newPassword }: UpdatePasswordParams): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error('Ошибка обновления пароля:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Ошибка updatePassword:', error);
      return { success: false, error: error.message || 'Произошла неизвестная ошибка' };
    }
  },

  verifyResetCode: async (email: string, code: string) => {
    try {
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  updateUserProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar: updates.avatar,
          risk_profile: updates.riskProfile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      }));
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
    }
  },
});
