import { kv } from '@vercel/kv';
import { AdminSettings } from '../types/types';

export async function getSettings(): Promise<AdminSettings> {
    try {
      const settings = await kv.get<AdminSettings>('siteSettings');
      return settings || {} as AdminSettings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {} as AdminSettings;
    }
  }
  
  export async function updateSettings(newSettings: Partial<AdminSettings>): Promise<void> {
    try {
      const currentSettings = await getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await kv.set('siteSettings', updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
  
  export async function getSetting<K extends keyof AdminSettings>(key: K): Promise<AdminSettings[K] | null> {
    try {
      const settings = await getSettings();
      return settings[key] || null;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }
  }