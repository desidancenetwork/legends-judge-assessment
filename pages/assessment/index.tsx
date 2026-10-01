import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../../contexts/AssessmentContext';
import VideoPlayer from '../../components/VideoPlayer';
import Timer from '../../components/Timer';
import NotesArea from '../../components/NotesArea';
import { useLeaveGuard } from '../../hooks/useLeaveGuard';
import { CONTACT_EMAIL } from '../../utils/constants';
import { setFlowCookie } from '../../utils/flowCookies';
import { activeVideoIds } from '../../utils/settings';
import { getSettings } from '../../utils/settingsStore';

interface AssessmentProps {
  videoIds: string[];
  additionalTime: number;
}

interface VideoStepProps {
  videoId: string;
  index: number;
  total: number;
  additionalTime: number;
  onComplete: (note: string) => void;
}

// Keyed by video index, so the video, timer and notes all start fresh for each team.
const VideoStep = ({ videoId, index, total, additionalTime, onComplete }: VideoStepProps) => {
  const [hasEnded, setHasEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const noteRef = useRef('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEnded = useCallback(() => setHasEnded(true), []);
  const handleNoteChange = useCallback((note: string) => {
    noteRef.current = note;
  }, []);
  const complete = useCallback(() => onComplete(noteRef.current), [onComplete]);

  return (
    <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-pontiac text-4xl text-white text-shadow-lg">Team {index + 1}</h3>
        <span className="text-gray-300 text-sm">Video {index + 1} of {total}</span>
      </div>
      <div className="mb-6">
        <VideoPlayer
          youtubeVideoId={videoId}
          onEnded={handleEnded}
          onProgress={setProgress}
        />
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></div>
        </div>
      </div>
      {hasEnded && (
        <div className="flex justify-center mb-6">
          <Timer durationSeconds={additionalTime} onTimeUp={complete} />
        </div>
      )}
      <NotesArea onChange={handleNoteChange} />
      <div className="flex justify-center mt-6">
        <button
          onClick={complete}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {index < total - 1 ? "Save and Continue" : "Continue to Ranking"}
        </button>
      </div>
    </div>
  );
};

const Assessment = ({ videoIds, additionalTime }: AssessmentProps) => {
  const router = useRouter();
  const { userInfo, addVideoNote, currentVideoIndex, setCurrentVideoIndex, setHasCompletedAssessment } = useAssessment();
  const savedIndexRef = useRef(-1);

  useLeaveGuard();

  useEffect(() => {
    if (!userInfo) {
      router.replace('/');
    }
  }, [userInfo, router]);

  const handleComplete = useCallback((note: string) => {
    // The button and the timer can both fire for the same video; only save it once.
    if (savedIndexRef.current >= currentVideoIndex) {
      return;
    }
    savedIndexRef.current = currentVideoIndex;
    addVideoNote({ videoId: currentVideoIndex, note });

    if (currentVideoIndex < videoIds.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setHasCompletedAssessment(true);
      setFlowCookie('hasCompletedAssessment');
      router.push('/assessment/ranking');
    }
  }, [addVideoNote, currentVideoIndex, videoIds.length, setCurrentVideoIndex, setHasCompletedAssessment, router]);

  if (videoIds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white text-center max-w-md">
          The assessment videos haven&apos;t been set up yet. Please contact{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 underline">{CONTACT_EMAIL}</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        {videoIds[currentVideoIndex] && (
          <VideoStep
            key={currentVideoIndex}
            videoId={videoIds[currentVideoIndex]}
            index={currentVideoIndex}
            total={videoIds.length}
            additionalTime={additionalTime}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<AssessmentProps> = async ({ req }) => {
  if (req.cookies.hasStartedAssessment !== 'true') {
    return {
      redirect: {
        destination: '/instructions',
        permanent: false,
      },
    };
  }

  const settings = await getSettings();
  return {
    props: {
      videoIds: activeVideoIds(settings),
      additionalTime: settings.assessment.additionalTime,
    },
  };
};

export default Assessment;
