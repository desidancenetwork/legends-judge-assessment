import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../../contexts/AssessmentContext';
import VideoPlayer from '../../components/VideoPlayer';
import Timer from '../../components/Timer';
import NotesArea from '../../components/NotesArea';
import { AdminSettings } from '../../types/types';
import { getServerSideSettings } from '../../utils/serverSettings';

interface AssessmentProps {
  settings: AdminSettings;
}

const Assessment = ({ settings }: AssessmentProps) => {
  const router = useRouter();
  const { userInfo, addVideoNote, currentVideoIndex, setCurrentVideoIndex, setHasCompletedAssessment } = useAssessment();
  const [timeRemaining, setTimeRemaining] = useState(settings.assessment.additionalTime);
  const [videos, setVideos] = useState<string[]>([]);
  const [, setIsVideoPlaying] = useState(false);
  const [, setIsVideoEnded] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [pendingNote, setPendingNote] = useState<string | null>(null);
  const currentNoteRef = useRef<string>('');

  useEffect(() => {
    if (!userInfo) {
      router.push('/');
    }

    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/admin/upload-video');
        const data = await response.json();
        if (Array.isArray(data.videos)) {
          setVideos(data.videos.map((video: any) => video.publicPath));
        } else {
          console.error('Unexpected response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [userInfo, router]);

  useEffect(() => {
    // Reset states when moving to a new video
    setIsVideoPlaying(false);
    setIsVideoEnded(false);
    setShowTimer(false);
    setTimeRemaining(settings.assessment.additionalTime);
    setPendingNote(null);
    currentNoteRef.current = '';
  }, [currentVideoIndex, settings.assessment.additionalTime]);

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
  }, []);

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
    }
  }, [pendingNote, addVideoNote, currentVideoIndex, videos.length, setCurrentVideoIndex, completeAssessment]);

  const handleTimeUp = useCallback(() => {
    handleNoteSubmit(currentNoteRef.current);
  }, [handleNoteSubmit]);

  if (videos.length === 0) {
    return <div className="text-white text-center">Loading videos...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold mb-4 text-white text-center text-shadow-lg">Video Assessment</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <h3 className="text-4xl mb-4 text-white text-center text-shadow-lg">Team {currentVideoIndex + 1}</h3>
          {videos[currentVideoIndex] && (
            <div className="mb-6">
              <VideoPlayer 
                key={currentVideoIndex}
                url={videos[currentVideoIndex]}
                onPlay={handleVideoPlay}
                onEnded={handleVideoEnd}
              />
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
          {currentVideoIndex < videos.length - 1 ? 
            <NotesArea 
              onSubmit={handleNoteSubmit} 
              onChange={handleNoteChange}
              timeRemaining={timeRemaining}
              buttonText="Submit and Proceed to Next Video"
            />
            :
            <NotesArea 
              onSubmit={handleNoteSubmit} 
              onChange={handleNoteChange}
              timeRemaining={timeRemaining}
              buttonText="Submit and Proceed to Ranking"
            />
          }
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const settings = getServerSideSettings();
  return { props: { settings } };
};

export default Assessment;