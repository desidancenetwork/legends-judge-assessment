import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../contexts/AssessmentContext';

const UploadNotes = () => {
  const router = useRouter();
  const { userInfo, videoNotes, rankings, hasCompletedRanking, setHasCompletedAssessment } = useAssessment();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const buttonText = files.length > 0 ? 'Upload and Finish' : 'Finish'

  useEffect(() => {
    if (!userInfo && !hasCompletedRanking) {
      router.push('/assessment/ranking');
    }
  }, [userInfo, hasCompletedRanking, router]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    const handlePopState = () => {
      router.replace('/upload-notes');
    };

    window.history.pushState(null, '', '/upload-notes');
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

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
  
      const handwrittenNotes = await Promise.all(
        files.map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ data: reader.result, type: file.type });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
  
      const payload = JSON.stringify({ assessmentData, handwrittenNotes });
  
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ?? 'Failed to submit assessment');
      }
      
      setHasCompletedAssessment(false);
      document.cookie = "hasCompletedAssessment=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "hasCompletedRanking=false; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      alert('Assessment submitted successfully!');
      router.push('/farewell');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [userInfo, videoNotes, rankings, files, router, setHasCompletedAssessment]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-pontiac mb-4 text-white text-center text-shadow-lg">Upload Handwritten Notes</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p className="text-white mb-4">Uploading handwritten notes is optional. If you have any, you may upload them here.</p>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            multiple
            className="mb-1 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <div className="flex justify-center mt-6">
            <button
              onClick={handleFinish}
              disabled={isUploading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isUploading ? 'Submitting...' : buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const hasCompletedRanking = req.cookies.hasCompletedRanking === 'true';

  if (!hasCompletedRanking) {
    return {
      redirect: {
        destination: '/assessment/ranking',
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default UploadNotes;