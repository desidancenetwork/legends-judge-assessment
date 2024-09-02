import { kv } from '@vercel/kv';
import { AdminSettings } from '../types/types';

export async function getSettings(): Promise<AdminSettings> {
  const settings = await kv.get<AdminSettings>('siteSettings');
  return settings || {
    appName: 'DDN Legends Mock Judging Assessment',
    assessment: {
      additionalTime: 300,
      totalVideos: 5,
      rankingTime: 1200,
    },
    googleDrive: {
      folderId: '1ZTlDj2DH6YQhQHajLLzfzXt8wBOlg-TB',
    },
  };
}

export async function updateSettings(newSettings: AdminSettings): Promise<void> {
  try {
    await kv.set('siteSettings', newSettings);
  } catch (error) {
    console.error('Error updating settings in KV store:', error);
    throw new Error(`Failed to update settings in KV store`);
  }
}