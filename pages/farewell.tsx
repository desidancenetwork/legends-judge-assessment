import { useEffect } from 'react';
import { useAssessment } from '../contexts/AssessmentContext';
import { CONTACT_EMAIL } from '../utils/constants';

const Farewell = () => {
  const { resetAssessment } = useAssessment();

  // The submission is done; clear it so the same session can't start the assessment again.
  useEffect(() => {
    resetAssessment();
  }, [resetAssessment]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="font-pontiac text-4xl mb-4 text-white text-center text-shadow-lg">Thank You!</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p className="text-white text-lg leading-relaxed">
            Your assessment has been successfully submitted.
            We appreciate your participation in the DDN Legends Dance Championship judging process and will be in touch with more information as soon as possible.
          </p>
          <p className="text-gray-300 mt-4">
            Questions? Reach out to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 underline hover:text-indigo-300">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Farewell;
