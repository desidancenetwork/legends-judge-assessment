import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../../contexts/AssessmentContext';
import VideoPlayer from '../../components/VideoPlayer';
import Timer from '../../components/Timer';
import NotesArea from '../../components/NotesArea';
import { AdminSettings } from '../../types/types';
import { getSettings } from '../../utils/kvUtils';

interface AssessmentProps {
  settings: AdminSettings;
}

const Assessment = ({ settings }: AssessmentProps) => {
  const router = useRouter();
  const { userInfo, addVideoNote, currentVideoIndex, setCurrentVideoIndex, setHasStartedAssessment, setHasCompletedAssessment } = useAssessment();
  const [timeRemaining, setTimeRemaining] = useState(settings.assessment.additionalTime);
  const [videos, setVideos] = useState<string[]>([]);
  const [, setIsVideoPlaying] = useState(false);
  const [, setIsVideoEnded] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [pendingNote, setPendingNote] = useState<string | null>(null);
  const currentNoteRef = useRef<string>('');
  const [progress, setProgress] = useState(0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!userInfo) {
      router.push('/');
    }

    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/admin/upload-video');
        const data = await response.json();
        if (Array.isArray(data.videos)) {
          setVideos(data.videos.map((video: any) => video.url));
        } else {
          console.error('Unexpected response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();

    if (!document.cookie.includes('hasStartedAssessment=true')) {
      document.cookie = "hasStartedAssessment=true; path=/";
      setHasStartedAssessment(true);
    }
  }, [userInfo, router, setHasStartedAssessment]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    const handlePopState = () => {
      router.push('/assessment');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  useEffect(() => {
    // Reset states when moving to a new video
    setIsVideoPlaying(false);
    setIsVideoEnded(false);
    setShowTimer(false);
    setTimeRemaining(settings.assessment.additionalTime);
    setPendingNote(null);
    currentNoteRef.current = '';
    setProgress(0);
    scrollToTop();
  }, [currentVideoIndex, settings.assessment.additionalTime]);

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
    setHasStartedAssessment(true);
  }, [setHasStartedAssessment]);

  const handleVideoEnd = useCallback(() => {
    setIsVideoEnded(true);
    setIsVideoPlaying(false);
    setShowTimer(true);
  }, []);

  const handleNoteSubmit = useCallback((note: string) => {
    setPendingNote(note);
  }, []);

  const handleNoteChange = useCallback((note: string) => {
    currentNoteRef.current = note;
  }, []);

  const completeAssessment = useCallback(() => {
    setHasCompletedAssessment(true);
    document.cookie = "hasCompletedAssessment=true; path=/";
    router.push('/assessment/ranking');
  }, [setHasCompletedAssessment, router]);

  useEffect(() => {
    if (pendingNote !== null) {
      addVideoNote({ videoId: currentVideoIndex, note: pendingNote });
      if (currentVideoIndex < videos.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else {
        completeAssessment();
      }
      setPendingNote(null);
      scrollToTop();
    }
  }, [pendingNote, addVideoNote, currentVideoIndex, videos.length, setCurrentVideoIndex, completeAssessment]);

  const handleTimeUp = useCallback(() => {
    handleNoteSubmit(currentNoteRef.current);
  }, [handleNoteSubmit]);

  const handleVideoProgress = useCallback((progress: number) => {
    setProgress(progress);
  }, []);

  if (videos.length === 0) {
    return <div className="text-white text-center">Loading videos...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-pontiac text-4xl text-white text-shadow-lg">Team {currentVideoIndex + 1}</h3>
            <span className="text-gray-300 text-sm">Video {currentVideoIndex + 1} of {videos.length}</span>
          </div>
          {videos[currentVideoIndex] && (
            <div className="mb-6">
              <VideoPlayer 
                key={currentVideoIndex}
                url={videos[currentVideoIndex]}
                onPlay={handleVideoPlay}
                onEnded={handleVideoEnd}
                onProgress={handleVideoProgress}
                maxHeight="20vh"
              />
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></div>
              </div>
            </div>
          )}
          {showTimer && (
            <div className="flex justify-center mb-6">
              <Timer 
                timeRemaining={timeRemaining} 
                setTimeRemaining={setTimeRemaining} 
                onTimeUp={handleTimeUp}
                totalTime={settings.assessment.additionalTime}
              />
            </div>
          )}
          <NotesArea 
            key={currentVideoIndex}
            onSubmit={handleNoteSubmit} 
            onChange={handleNoteChange}
          />
          <div className="flex justify-center mt-6">
            <button
              onClick={() => handleNoteSubmit(currentNoteRef.current)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {currentVideoIndex < videos.length - 1 ? 
                "Save and Continue" : 
                "Continue to Ranking"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const settings = await getSettings();

  const { req } = context;
  const hasStartedAssessment = req.cookies.hasStartedAssessment === 'true';

  if (!hasStartedAssessment) {
    return {
      redirect: {
        destination: '/instructions',
        permanent: false,
      },
    };
  }
  return { props: { settings } };
};

export default Assessment;