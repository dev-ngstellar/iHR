import * as SecureStore from 'expo-secure-store';
import { APP_CONFIG } from '../constants/config';
import { UserSession } from '../types/auth';

export const saveSession = async (session: UserSession): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(session);
    await SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.USER_SESSION, jsonValue);
  } catch (error) {
    console.error('Error saving session to SecureStore:', error);
  }
};

export const getSession = async (): Promise<UserSession | null> => {
  try {
    const jsonValue = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting session from SecureStore:', error);
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.USER_SESSION);
  } catch (error) {
    console.error('Error clearing session from SecureStore:', error);
  }
};
