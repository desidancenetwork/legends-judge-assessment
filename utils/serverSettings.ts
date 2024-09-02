import fs from 'fs';
import path from 'path';
import { AdminSettings } from '../types/types';

const settingsFilePath = path.join(process.cwd(), 'settings.json');

function getDefaultSettings(): AdminSettings {
  return {
    appName: "DDN Legends Mock Judging Assessment",
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api",
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

export function getServerSideSettings(): AdminSettings {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const settingsData = fs.readFileSync(settingsFilePath, 'utf8');
      return JSON.parse(settingsData);
    }
  } catch (error) {
    console.error('Error reading settings file:', error);
  }
  
  // If file doesn't exist or there's an error, return default settings
  return getDefaultSettings();
}

export function updateServerSideSettings(newSettings: Partial<AdminSettings>): AdminSettings {
  const currentSettings = getServerSideSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  
  try {
    // Ensure the directory exists
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(settingsFilePath, JSON.stringify(updatedSettings, null, 2));
    return updatedSettings;
  } catch (error) {
    console.error('Error writing settings file:', error);
    throw new Error('Failed to update settings');
  }
}