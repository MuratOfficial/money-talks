import { supabase } from '@/lib/supabase';
import { deleteUserDataFromServer, syncUserDataToServer } from '@/services/api';
import {
  AppState,
  AuthResponse,
  SliceCreator,
  UpdatePasswordParams,
  User,
  VerifyOtpParams,
} from './types';
import { initialCategories } from './initialData';

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

/**
 * Синхронизируемые данные, приведённые к состоянию «как после установки».
 *
 * Раньше signOut чистил только часть полей (goals, categories, wallets, ЛФП),
 * а expences/incomes/actives/passives и lastSyncHash оставались от прошлого
 * пользователя. При следующем входе useSync видел «локальные данные есть и они
 * разошлись с последней синхронизацией» и отправлял этот огрызок на сервер,
 * затирая там нормальную копию — отсюда «данные пропали после выхода». Если на
 * устройстве входил другой человек, ему в аккаунт уезжали чужие доходы и расходы.
 *
 * Поэтому сбрасываем ВСЕ поля из SYNCABLE_FIELDS и lastSyncHash: пустое
 * состояние не проходит hasSyncableData, и на входе серверные данные будут
 * приняты, а не перезаписаны. categories возвращаем к начальному набору, иначе
 * следующий пользователь остался бы вообще без категорий доходов и расходов.
 *
 * theme/language/currency намеренно не трогаем — это настройки устройства,
 * и на затирание серверных данных они не влияют.
 */
const freshSyncableState = () => ({
  categories: initialCategories,
  wallets: [],
  expences: [],
  incomes: [],
  actives: [],
  passives: [],
  goals: [],
  personalFinancialPlan: null,
  riskProfile: null,
  lastSyncHash: null,
});

export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  logout: () => set({ user: null, isAuthenticated: false, ...freshSyncableState() }),

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
    const { user } = get();
    try {
      // Досылаем последние правки перед очисткой: автосинхронизация работает с
      // задержкой, и всё, что не успело уехать, иначе пропало бы вместе с
      // локальным состоянием.
      if (user?.id) {
        try {
          await syncUserDataToServer(user.id, get());
        } catch (e) {
          console.warn('signOut: финальная синхронизация не удалась', e);
        }
      }

      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, ...freshSyncableState() });
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

      // 2. Удаляем саму учётную запись через RPC delete_user (SECURITY DEFINER,
      //    удаляет строку в auth.users по auth.uid()).
      //
      //    Если удалить не удалось — ОСТАНАВЛИВАЕМСЯ и честно возвращаем ошибку.
      //    Раньше здесь был console.warn и success: true: пользователь видел
      //    «аккаунт удалён», его разлогинивало, а учётная запись оставалась жива,
      //    и под ней можно было войти снова. Apple проверяет ровно этот сценарий
      //    (гайдлайн 5.1.1(v)), да и обманывать пользователя нельзя.
      //
      //    Локальные данные при этом намеренно не трогаем: серверные уже удалены
      //    шагом выше, и ближайшая синхронизация зальёт их обратно из локальной
      //    копии — так частичный сбой не превращается в потерю данных.
      const { error: rpcError } = await supabase.rpc('delete_user');
      if (rpcError) {
        console.error('deleteAccount: RPC delete_user не выполнился', rpcError.message);
        return {
          success: false,
          error: 'Не удалось удалить аккаунт. Попробуйте позже или напишите в поддержку.',
        };
      }

      // 3. Аккаунта больше нет — завершаем сессию и чистим локальное состояние.
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, ...freshSyncableState() });

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
