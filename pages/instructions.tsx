import { useCallback, useEffect } from 'react';
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
  const { userInfo, setHasStartedAssessment } = useAssessment();

  useEffect(() => {
    if (!userInfo) {
      router.push('/');
    }
  }, [userInfo, router]);

  const handleStart = useCallback(() => {
    setHasStartedAssessment(true);
    document.cookie = "hasStartedAssessment=true; path=/";
    router.push('/assessment');
  }, [setHasStartedAssessment, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="font-pontiac text-4xl mb-4 text-white text-shadow-lg">Instructions</h1>
        </div>
        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p>
            You will be required to watch a pre-selected compilation of THREE back row performances.<br /><br /> As each video is playing, you will be REQUIRED
            to take notes directly into an open-ended response section. You will have the length of the video plus an additional 5 minutes after the
            video has ended to complete your notes. Your notes will auto-submit once the timer runs out.<br /><br /> Your notes do not have to be written in complete
            sentences/paragraphs! This is just for you to get a feel for judging in real-time, and for us to better prepare our training curriculum for
            the season.<br /><br /> You will be REQUIRED to rank all three videos, and provide an explanation for your rankings. You will have 20 minutes to complete
            your explanation. Your response will auto-submit once the timer runs out. We would like your explanation to be written in complete sentences/paragraphs.<br /><br />
            Please make sure you have stable internet connection before beginning.<br /><br /> Please complete this mock judging as thoroughly as possible.
            If you have any questions, please reach out to Legends Judging Relations at
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