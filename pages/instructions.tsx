import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
            <li>You will be required to watch a pre-selected compilation of {settings.assessment.totalVideos} back row performances.</li>
            <li>Take notes in the provided area during each video.</li>
            <li>You will have the length of each video PLUS an additional {settings.assessment.additionalTime / 60} minutes after to complete your notes.</li>
            <li>Once started, videos cannot be paused or replayed. Notes auto-submit when time expires.</li>
            <li>Notes are for your personal use — they do not have to be perfect/formal! This is just for you to get a feel for judging in real-time, and for us to better prepare our training curriculum for the season.</li>
            <li>Using scratch paper for handwritten notes is permitted; you will have the option to upload a picture of them at the end of the assessment.</li>
            <li>After all videos, you have {settings.assessment.rankingTime / 60} minutes to rank performances and explain your rankings.</li>
            <li>Use complete sentences for the ranking explanations. Responses auto-submit when time expires.</li>
            <li>Ensure you have a stable internet connection before beginning.</li>
          </ul>
          <p>Complete this mock assessment as thoroughly as possible. If you have any questions or run into any issues, please reach out to Legends Judging Relations at
            <Link 
              href="mailto:legendsjudging@desidancenetwork.com"
              className="text-indigo-400 pl-1 hover:text-indigo-300 underline"
            >
              legendsjudging@desidancenetwork.com
            </Link>.
          </p>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start
            </button>
          </div>
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