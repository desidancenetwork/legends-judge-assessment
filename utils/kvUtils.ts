import { kv } from '@vercel/kv';
import { AdminSettings } from '../types/types';

const SETTINGS_KEY = 'siteSettings';

export async function getSettings(): Promise<AdminSettings> {
  const settings = await kv.get<AdminSettings>(SETTINGS_KEY);
  return settings ?? getDefaultSettings();
}

export async function updateSettings(newSettings: AdminSettings): Promise<void> {
  await kv.set(SETTINGS_KEY, newSettings);
}

function getDefaultSettings(): AdminSettings {
  return {
    appName: "DDN Legends Mock Judging Assessment",
    assessment: {
      additionalTime: 300,
      totalVideos: 3,
      rankingTime: 1200
    },
    googleDrive: {
      folderId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID ?? "root"
    }
  };
}