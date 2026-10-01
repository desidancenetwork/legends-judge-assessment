import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { AdminSettings } from '../../types/types';
import { LOGIN_REDIRECT, isAdmin } from '../../utils/adminSession';
import { MAX_VIDEOS } from '../../utils/constants';
import { parseDriveFolderId, parseYouTubeId, validateSettings } from '../../utils/settings';
import { getSettings } from '../../utils/settingsStore';

interface SettingsProps {
  initialSettings: AdminSettings;
}

// Times are edited in minutes but stored in seconds.
type FormState = {
  additionalMinutes: string;
  rankingMinutes: string;
  totalVideos: number;
  videoInputs: string[];
  folderInput: string;
};

const toForm = ({ assessment, googleDrive }: AdminSettings): FormState => ({
  additionalMinutes: String(assessment.additionalTime / 60),
  rankingMinutes: String(assessment.rankingTime / 60),
  totalVideos: Math.min(Math.max(assessment.totalVideos, 1), MAX_VIDEOS),
  videoInputs: Array.from({ length: MAX_VIDEOS }, (_, index) => assessment.youtubeVideoIds[index] ?? ''),
  folderInput: googleDrive.folderId,
});

const minutesToSeconds = (value: string) => (value.trim() === '' ? NaN : Math.round(Number(value) * 60));

const fromForm = (form: FormState): AdminSettings => ({
  assessment: {
    additionalTime: minutesToSeconds(form.additionalMinutes),
    rankingTime: minutesToSeconds(form.rankingMinutes),
    totalVideos: form.totalVideos,
    youtubeVideoIds: form.videoInputs.slice(0, form.totalVideos).map((input) => parseYouTubeId(input) ?? input.trim()),
  },
  googleDrive: {
    folderId: parseDriveFolderId(form.folderInput),
  },
});

const inputBaseClassName = 'block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white sm:text-sm';
const inputClassName = `mt-1 ${inputBaseClassName}`;
const labelClassName = 'block text-sm font-medium text-gray-200';

const Settings = ({ initialSettings }: SettingsProps) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toForm(initialSettings));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const update = (changes: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...changes }));
    setSaved(false);
  };

  const updateVideo = (index: number, value: string) =>
    update({ videoInputs: form.videoInputs.map((input, i) => (i === index ? value : input)) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    const settings = fromForm(form);
    const validationError = validateSettings(settings);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message ?? 'Failed to update settings');
      }
      setForm(toForm(body));
      setSaved(true);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Link href="/admin/dashboard">
        <span className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Back
        </span>
      </Link>
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-pontiac text-white text-center mb-8 text-shadow-lg">Application Settings</h1>
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="totalVideos" className={labelClassName}>Number of videos</label>
                  <select
                    id="totalVideos"
                    value={form.totalVideos}
                    onChange={(e) => update({ totalVideos: Number(e.target.value) })}
                    className={inputClassName}
                  >
                    {Array.from({ length: MAX_VIDEOS }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="additionalMinutes" className={labelClassName}>
                    Note time after each video (0-10 min)
                  </label>
                  <input
                    type="number"
                    id="additionalMinutes"
                    value={form.additionalMinutes}
                    onChange={(e) => update({ additionalMinutes: e.target.value })}
                    min={0}
                    max={10}
                    step={0.5}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="rankingMinutes" className={labelClassName}>
                    Ranking time (1-30 min)
                  </label>
                  <input
                    type="number"
                    id="rankingMinutes"
                    value={form.rankingMinutes}
                    onChange={(e) => update({ rankingMinutes: e.target.value })}
                    min={1}
                    max={30}
                    step={0.5}
                    className={inputClassName}
                  />
                </div>
              </div>

              {form.videoInputs.slice(0, form.totalVideos).map((input, index) => {
                const videoId = parseYouTubeId(input);
                return (
                  <div key={index}>
                    <label htmlFor={`video${index + 1}`} className={labelClassName}>
                      Video {index + 1} (YouTube link or video ID)
                    </label>
                    <div className="mt-1 flex items-center gap-3">
                      <input
                        type="text"
                        id={`video${index + 1}`}
                        value={input}
                        onChange={(e) => updateVideo(index, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=…"
                        className={inputBaseClassName}
                      />
                      {videoId && (
                        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element -- small external thumbnail, no optimization needed */}
                          <img src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt={`Video ${index + 1} thumbnail`} className="h-12 w-auto rounded" />
                        </a>
                      )}
                    </div>
                    {input.trim() && !videoId && (
                      <p className="mt-1 text-sm text-yellow-300">That doesn&apos;t look like a YouTube link or video ID.</p>
                    )}
                  </div>
                );
              })}

              <div>
                <label htmlFor="folder" className={labelClassName}>
                  Google Drive submissions folder (link or folder ID)
                </label>
                <input
                  type="text"
                  id="folder"
                  value={form.folderInput}
                  onChange={(e) => update({ folderInput: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/…"
                  className={inputClassName}
                />
                <p className="mt-1 text-sm text-gray-400">
                  The folder must be shared (as Editor) with the app&apos;s Google service account.
                </p>
              </div>

              {error && <p className="mt-2 text-sm text-red-400" role="alert">{error}</p>}
              {saved && <p className="mt-2 text-sm text-green-400" role="status">Settings saved.</p>}
              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<SettingsProps> = async (context) => {
  if (!(await isAdmin(context))) {
    return LOGIN_REDIRECT;
  }
  return { props: { initialSettings: await getSettings() } };
};

export default Settings;
