import { Redis } from '@upstash/redis';
import type { AdminSettings } from '../types/types';
import { DEFAULT_SETTINGS, normalizeSettings } from './settings';

const SETTINGS_KEY = 'siteSettings';

// KV_REST_API_URL / KV_REST_API_TOKEN are added automatically when an Upstash Redis
// store is connected to the Vercel project.
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
    : null;

// Without Redis (local development) settings are kept in memory until the dev server restarts.
const devStore = globalThis as typeof globalThis & { __legendsSettings?: AdminSettings };

function assertConfigured() {
  if (!redis && process.env.NODE_ENV === 'production') {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN must be set in production.');
  }
}

export async function getSettings(): Promise<AdminSettings> {
  assertConfigured();
  const stored = redis ? await redis.get(SETTINGS_KEY) : devStore.__legendsSettings;
  return normalizeSettings(stored ?? DEFAULT_SETTINGS);
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  assertConfigured();
  if (redis) {
    await redis.set(SETTINGS_KEY, settings);
  } else {
    devStore.__legendsSettings = settings;
  }
}
