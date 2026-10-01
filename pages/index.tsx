import { useEffect } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import RegistrationForm from '../components/RegistrationForm';
import { useAssessment } from '../contexts/AssessmentContext';

const Home: NextPage = () => {
  const { resetAssessment } = useAssessment();

  useEffect(() => {
    resetAssessment();
  }, [resetAssessment]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <Image
          src="/legends-logo.png"
          alt="Legends Logo"
          width={400}
          height={236}
          priority
          className="mx-auto w-full max-w-[400px] h-auto"
        />
        <div>
          <h2 className="font-pontiac mt-6 text-center text-4xl text-white">
            DDN Legends<br />Mock Judging Assessment
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

export default Home;
