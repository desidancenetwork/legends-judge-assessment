import { useEffect } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Image from 'next/image';
import RegistrationForm from '../components/RegistrationForm';
import { useAssessment } from '../contexts/AssessmentContext';
import { AdminSettings } from '../types/types';
import { getSettings } from '../utils/kvUtils';

interface HomeProps {
  settings: AdminSettings;
}

const Home: NextPage<HomeProps> = ({ settings }) => {
  const { resetAssessment } = useAssessment();

  useEffect(() => {
    resetAssessment();
  }, [resetAssessment]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="relative w-full" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Image
            src="/legends-logo.png"
            alt="Legends Logo"
            width={400}
            height={200}
            layout="responsive"
            priority
          />
        </div>
        <div>
          <h2 className="font-pontiac mt-6 text-center text-4xl text-white">
            {settings.appName}
          </h2>
          <p className="mt-2 text-center text-lg text-gray-300">
            Register to begin
          </p>
        </div>
        <RegistrationForm />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const settings = await getSettings();
  return { props: { settings } };
};

export default Home;