import type { AdminSettings } from '../types/types';
import { MAX_VIDEOS } from './constants';

// Shared by the browser and the server; Redis access lives in settingsStore.ts.

export const DEFAULT_SETTINGS: AdminSettings = {
  assessment: {
    additionalTime: 300,
    totalVideos: 3,
    rankingTime: 1200,
    youtubeVideoIds: [],
  },
  googleDrive: {
    folderId: '',
  },
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const DRIVE_ID = /^[A-Za-z0-9_-]{10,}$/;

/** Accepts a bare video ID or any common YouTube URL (watch, youtu.be, embed, shorts, live). */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, '');
    let id: string | null | undefined;
    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1];
    } else if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
      id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/)?.[1];
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Accepts a bare folder ID or a Google Drive folder URL. */
export function parseDriveFolderId(input: string): string {
  const value = input.trim();
  return value.match(/\/folders\/([A-Za-z0-9_-]+)/)?.[1] ?? value.match(/[?&]id=([A-Za-z0-9_-]+)/)?.[1] ?? value;
}

/** Fills in defaults for anything missing or malformed in stored settings. */
export function normalizeSettings(stored: unknown): AdminSettings {
  const settings = (stored ?? {}) as Partial<AdminSettings>;
  const assessment: Partial<AdminSettings['assessment']> = settings.assessment ?? {};
  const defaults = DEFAULT_SETTINGS.assessment;
  const numberOr = (value: unknown, fallback: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

  return {
    assessment: {
      additionalTime: numberOr(assessment.additionalTime, defaults.additionalTime),
      totalVideos: numberOr(assessment.totalVideos, defaults.totalVideos),
      rankingTime: numberOr(assessment.rankingTime, defaults.rankingTime),
      youtubeVideoIds: Array.isArray(assessment.youtubeVideoIds)
        ? assessment.youtubeVideoIds.filter((id): id is string => typeof id === 'string')
        : [],
    },
    googleDrive: {
      folderId: typeof settings.googleDrive?.folderId === 'string' ? settings.googleDrive.folderId : '',
    },
  };
}

/** The videos judges actually watch, in order. */
export function activeVideoIds(settings: AdminSettings): string[] {
  return settings.assessment.youtubeVideoIds.slice(0, settings.assessment.totalVideos).filter(Boolean);
}

export function validateSettings(settings: AdminSettings): string | null {
  const { additionalTime, totalVideos, rankingTime, youtubeVideoIds } = settings.assessment;

  if (!Number.isInteger(totalVideos) || totalVideos < 1 || totalVideos > MAX_VIDEOS) {
    return `Number of videos must be between 1 and ${MAX_VIDEOS}.`;
  }
  if (!Number.isFinite(additionalTime) || additionalTime < 0 || additionalTime > 600) {
    return 'Note-taking time after each video must be between 0 and 10 minutes.';
  }
  if (!Number.isFinite(rankingTime) || rankingTime < 60 || rankingTime > 1800) {
    return 'Ranking time must be between 1 and 30 minutes.';
  }
  if (youtubeVideoIds.length !== totalVideos || youtubeVideoIds.some((id) => !YOUTUBE_ID.test(id))) {
    return `Enter a valid YouTube link or video ID for each of the ${totalVideos} videos.`;
  }
  if (!DRIVE_ID.test(settings.googleDrive.folderId)) {
    return 'Enter the Google Drive folder (link or ID) where submissions should be saved.';
  }
  return null;
}

/** 300 -> "5 minutes", 90 -> "1 minute 30 seconds". */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  const parts: string[] = [];
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  if (seconds || !minutes) parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
  return parts.join(' ');
}
