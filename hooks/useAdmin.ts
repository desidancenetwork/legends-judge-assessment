import { useState } from 'react';
import { uploadVideo, updateSettings } from '../utils/api';

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoUpload = async (file: File, slotId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await uploadVideo(file, slotId);
    } catch (err) {
      setError('Failed to upload video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsUpdate = async (settings: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateSettings(settings);
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleVideoUpload,
    handleSettingsUpdate,
  };
};