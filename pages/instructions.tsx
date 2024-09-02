import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../contexts/AssessmentContext';
import { AdminSettings } from '../types/types';
import { getSettings } from '../utils/kvUtils';

interface InstructionsProps {
  settings: AdminSettings;
}

const Instructions = ({ settings }: InstructionsProps) => {
  const router = useRouter();
  const { userInfo } = useAssessment();

  useEffect(() => {
    if (!userInfo) {
      router.push('/');
    }
  }, [userInfo, router]);

  const handleStart = () => {
    router.push('/assessment');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-white text-shadow-lg">Instructions</h1>
        </div>
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <ul className="list-disc pl-5 space-y-2 mb-6 text-gray-200">
            <li>You will watch {settings.assessment.totalVideos} dance performance videos.</li>
            <li>Each video is about 10 minutes long.</li>
            <li>Once you start, you cannot pause or replay the videos.</li>
            <li>You may use the duration of each video plus an additional {settings.assessment.additionalTime / 60} minutes after to complete your notes.</li>
            <li>After watching all videos, you&apos;ll have {settings.assessment.rankingTime / 60} minutes to rank the performances and provide justifications.</li>
            <li>If the timer runs out before you finish, whatever you have typed will be submitted.</li>
            <li>Ensure you have a stable internet connection before beginning.</li>
          </ul>
          <button 
            onClick={handleStart}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-lg"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const settings = await getSettings();
  return { props: { settings } };
};

export default Instructions;