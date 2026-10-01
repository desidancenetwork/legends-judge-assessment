import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../contexts/AssessmentContext';
import { CONTACT_EMAIL } from '../utils/constants';
import { setFlowCookie } from '../utils/flowCookies';
import { activeVideoIds, formatDuration } from '../utils/settings';
import { getSettings } from '../utils/settingsStore';

interface InstructionsProps {
  videoCount: number;
  additionalTime: number;
  rankingTime: number;
}

const NUMBER_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];

const Instructions = ({ videoCount, additionalTime, rankingTime }: InstructionsProps) => {
  const router = useRouter();
  const { userInfo } = useAssessment();
  const count = NUMBER_WORDS[videoCount] ?? String(videoCount);

  useEffect(() => {
    if (!userInfo) {
      router.replace('/');
    }
  }, [userInfo, router]);

  const handleStart = useCallback(() => {
    setFlowCookie('hasStartedAssessment');
    router.push('/assessment');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="font-pontiac text-4xl mb-4 text-white text-shadow-lg">Instructions</h1>
        </div>
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p>
            You will be required to watch a pre-selected compilation of {count} back row performance{videoCount === 1 ? '' : 's'}.<br /><br />
            As each video is playing, you will be REQUIRED to take notes directly into an open-ended response section.{' '}
            {additionalTime > 0
              ? `You will have the length of the video plus an additional ${formatDuration(additionalTime)} after the video has ended to complete your notes.`
              : 'You will have the length of the video to complete your notes.'}{' '}
            Your notes will auto-submit once the timer runs out.<br /><br />
            Your notes do not have to be written in complete sentences/paragraphs! This is just for you to get a feel for judging in real-time,
            and for us to better prepare our training curriculum for the season.<br /><br />
            You will be REQUIRED to rank {videoCount === 1 ? 'the video' : `all ${count.toLowerCase()} videos`}, and provide an explanation for your rankings.
            You will have {formatDuration(rankingTime)} to complete your explanation. Your response will auto-submit once the timer runs out.
            We would like your explanation to be written in complete sentences/paragraphs.<br /><br />
            Please make sure you have stable internet connection before beginning, and keep this tab open until you finish.<br /><br />
            Please complete this mock judging as thoroughly as possible.
            If you have any questions, please reach out to Legends Judging Relations at
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-400 pl-1 hover:text-indigo-300 underline"
            >
              {CONTACT_EMAIL}
            </a>.
          </p>
          <div className="flex justify-center mt-6">
            {videoCount > 0 ? (
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start
              </button>
            ) : (
              <p className="text-yellow-300 text-center">
                The assessment isn&apos;t open yet. Please check back later.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<InstructionsProps> = async () => {
  const settings = await getSettings();
  return {
    props: {
      videoCount: activeVideoIds(settings).length,
      additionalTime: settings.assessment.additionalTime,
      rankingTime: settings.assessment.rankingTime,
    },
  };
};

export default Instructions;
