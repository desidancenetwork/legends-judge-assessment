import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { AdminSettings } from '../../types/types';
import { getSettings, updateSettings } from '../../utils/kvUtils';
import axios from 'axios';

interface SettingsProps {
  initialSettings: AdminSettings;
}

const Settings = ({ initialSettings }: SettingsProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [localSettings, setLocalSettings] = useState<AdminSettings>({
    ...initialSettings,
    assessment: {
      ...initialSettings.assessment,
      additionalTime: initialSettings.assessment.additionalTime / 60,
      rankingTime: initialSettings.assessment.rankingTime / 60,
    }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, key] = name.split('.');

    setLocalSettings((prev) => {
      if (section === 'assessment') {
        return {
          ...prev,
          assessment: {
            ...prev.assessment,
            [key]: value,
          },
        };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const validateSettings = (settings: AdminSettings): string | null => {
    const { assessment, appName } = settings;

    if (appName.length > 50) {
      return 'App name must not exceed 50 characters.';
    }

    const totalVideos = Number(assessment.totalVideos);
    if (isNaN(totalVideos) || totalVideos < 0 || totalVideos > 5) {
      return 'Total videos must be between 0 and 5.';
    }

    const additionalTime = Number(assessment.additionalTime);
    if (isNaN(additionalTime) || additionalTime < 0 || additionalTime > 10) {
      return 'Additional time must be between 0 and 10 minutes.';
    }

    const rankingTime = Number(assessment.rankingTime);
    if (isNaN(rankingTime) || rankingTime < 0 || rankingTime > 30) {
      return 'Ranking time must be between 0 and 30 minutes.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const validationError = validateSettings(localSettings);
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    const settingsToSubmit = {
      ...localSettings,
      assessment: {
        ...localSettings.assessment,
        additionalTime: Number(localSettings.assessment.additionalTime) * 60,
        totalVideos: Number(localSettings.assessment.totalVideos),
        rankingTime: Number(localSettings.assessment.rankingTime) * 60,
      },
    };

    try {
      const response = await axios.post('/api/admin/settings', settingsToSubmit);
      console.log('Update response:', response.data);
      
      const updatedSettings = response.data;
      setLocalSettings({
        ...updatedSettings,
        assessment: {
          ...updatedSettings.assessment,
          additionalTime: updatedSettings.assessment.additionalTime / 60,
          rankingTime: updatedSettings.assessment.rankingTime / 60,
        }
      });

      alert('Settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(`Failed to update settings. Please try again.`);
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
          <h1 className="text-3xl font-bold text-white text-center mb-8 text-shadow-lg">Application Settings</h1>
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="appName" className="block text-sm font-medium text-gray-200">
                  App Name (max 50 characters)
                </label>
                <input
                  type="text"
                  name="appName"
                  id="appName"
                  value={localSettings.appName}
                  onChange={handleChange}
                  maxLength={50}
                  className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="assessment.additionalTime" className="block text-sm font-medium text-gray-200">
                  Additional Time (0-10 min)
                </label>
                <input
                  type="number"
                  name="assessment.additionalTime"
                  id="assessment.additionalTime"
                  value={localSettings.assessment.additionalTime}
                  onChange={handleChange}
                  min={0}
                  max={10}
                  step={0.5}
                  className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="assessment.totalVideos" className="block text-sm font-medium text-gray-200">
                  Total Videos (0-5)
                </label>
                <input
                  type="number"
                  name="assessment.totalVideos"
                  id="assessment.totalVideos"
                  value={localSettings.assessment.totalVideos}
                  onChange={handleChange}
                  min={0}
                  max={5}
                  className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="assessment.rankingTime" className="block text-sm font-medium text-gray-200">
                  Ranking Time (0-30 min)
                </label>
                <input
                  type="number"
                  name="assessment.rankingTime"
                  id="assessment.rankingTime"
                  value={localSettings.assessment.rankingTime}
                  onChange={handleChange}
                  min={0}
                  max={30}
                  step={0.5}
                  className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="googleDrive.folderId" className="block text-sm font-medium text-gray-200">
                  Google Drive Folder ID
                </label>
                <input
                  type="text"
                  name="googleDrive.folderId"
                  id="googleDrive.folderId"
                  value={localSettings.googleDrive.folderId}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white sm:text-sm"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`);
    return { props: { initialSettings: response.data } };
  } catch (error) {
    console.error('Error fetching initial settings:', error);
    return { props: { initialSettings: {} } };
  }
};

export default Settings;