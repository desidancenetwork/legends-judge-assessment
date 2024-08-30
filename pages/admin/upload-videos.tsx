import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import AdminNavigation from '../../components/AdminNavigation';
import { uploadVideo, getUploadedVideos } from '../../utils/api';
import { VideoSlot, AdminSettings } from '../../types/types';
import { getServerSideSettings } from '../../utils/serverSettings';

interface UploadVideosProps {
  settings: AdminSettings;
}

const UploadVideos = ({ settings }: UploadVideosProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videoSlots, setVideoSlots] = useState<VideoSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploadedVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const videos = await getUploadedVideos();
      setVideoSlots(Array.from({ length: settings.assessment.totalVideos }, (_, index) => {
        const id = (index + 1).toString();
        const video = videos.find(v => v.id === id);
        return video 
          ? { ...video, uploading: false, error: null }
          : {
              id,
              file: null,
              url: null,
              publicPath: null,
              originalName: null,
              uploading: false,
              error: null,
            };
      }));
    } catch (error) {
      console.error('Error fetching uploaded videos:', error);
      setError('Failed to fetch uploaded videos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    if (session && settings) {
      fetchUploadedVideos();
    }
  }, [session, settings, fetchUploadedVideos]);

  if (status === 'loading') {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!session) {
    router.push('/admin/login');
    return null;
  }

  const handleFileUpload = (id: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setVideoSlots(slots => slots.map(slot => 
          slot.id === id ? { ...slot, file, uploading: true, error: null } : slot
        ));
        const updatedSlot = await uploadVideo(file, id);
        setVideoSlots(slots => slots.map(slot => 
          slot.id === id ? { ...updatedSlot, file: null } : slot
        ));
        alert(`Video ${id} uploaded successfully!`);
      } catch (err) {
        console.error(`Error uploading video ${id}:`, err);
        setVideoSlots(slots => slots.map(slot => 
          slot.id === id ? { ...slot, uploading: false, error: 'Failed to upload video. Please try again.' } : slot
        ));
      }
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
          <h1 className="text-3xl font-bold text-white text-center mb-8 text-shadow-lg">Upload Assessment Videos</h1>
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            {loading && <p className="text-white mt-4">Loading videos...</p>}
            {error && <p className="text-red-400 mt-4">{error}</p>}
            {videoSlots.map(slot => (
              <div key={slot.id} className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                <h2 className="text-xl font-semibold text-white mb-2">Video {slot.id}</h2>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload(slot.id)}
                  className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-600 file:text-white
                  hover:file:bg-indigo-700 transition duration-150 ease-in-out"
                />
                {slot.uploading && <p className="mt-2 text-yellow-400">Uploading...</p>}
                {slot.originalName && <p className="mt-2 text-green-400">Video uploaded: {slot.originalName}</p>}
                {slot.error && <p className="mt-2 text-red-400">{slot.error}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const settings = getServerSideSettings();
  return { props: { settings } };
};

export default UploadVideos;