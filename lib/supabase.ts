import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const storage = Platform.OS === 'web' ? undefined : AsyncStorage

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
})