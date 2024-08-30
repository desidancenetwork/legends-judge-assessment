import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAssessment } from '../contexts/AssessmentContext';
import { submitAssessment } from '../utils/api';

const UploadNotes = () => {
  const router = useRouter();
  const { userInfo, videoNotes, rankings } = useAssessment();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }, []);

  const handleFinish = useCallback(async () => {
    if (!userInfo) {
      alert('User information is missing. Please go back and fill in your details.');
      return;
    }

    setIsUploading(true);
    try {
      const assessmentData = {
        userInfo,
        videoNotes,
        rankings,
      };

      await submitAssessment(assessmentData, files);
      alert('Assessment submitted successfully!');
      router.push('/farewell');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [userInfo, videoNotes, rankings, files, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold mb-4 text-white text-center text-shadow-lg">Upload Handwritten Notes</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p className="text-white mb-4">Uploading handwritten notes is optional. If you have any, you can upload them here.</p>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            multiple
            className="mb-4 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <button 
            onClick={handleFinish}
            disabled={isUploading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-lg"
          >
            {isUploading ? 'Submitting...' : files.length > 0 ? 'Upload and Finish' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadNotes;