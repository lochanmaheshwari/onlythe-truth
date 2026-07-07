import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const webStorageAdapter = {
  getItem: (key: string) => {
    try { return Promise.resolve(localStorage.getItem(key)); } catch (e) { return Promise.resolve(null); }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); return Promise.resolve(); } catch (e) { return Promise.resolve(); }
  },
  removeItem: (key: string) => {
    try { localStorage.removeItem(key); return Promise.resolve(); } catch (e) { return Promise.resolve(); }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zmnecxlcwxyiqyoobzxu.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbmVjeGxjd3h5aXF5b29ienh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzQzNzUsImV4cCI6MjA5ODY1MDM3NX0.7VOeQg8sIm83zejP1PQ_Bp13BLbCaMG2tlCV0Rj4bzY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: (Platform.OS === 'web' ? webStorageAdapter : ExpoSecureStoreAdapter) as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
