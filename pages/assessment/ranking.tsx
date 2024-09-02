import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../../contexts/AssessmentContext';
import RankingForm from '../../components/RankingForm';
import Timer from '../../components/Timer';
import { Ranking, AdminSettings } from '../../types/types';
import { getSettings } from '../../utils/kvUtils';

interface RankingPageProps {
  settings: AdminSettings;
}

const RankingPage = ({ settings }: RankingPageProps) => {
  const router = useRouter();
  const { userInfo, setRankings, hasCompletedAssessment, setHasCompletedRanking } = useAssessment();
  const [timeRemaining, setTimeRemaining] = useState(settings.assessment.rankingTime);
  const rankingsRef = useRef<Ranking[]>([]);

  useEffect(() => {
    if (!userInfo) {
      router.push('/');
    } else if (!hasCompletedAssessment) {
      router.push('/assessment');
    }
  }, [userInfo, hasCompletedAssessment, router]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = () => {
      router.push('/assessment/ranking');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const handleSubmit = useCallback((rankings: Ranking[]) => {
    setRankings(rankings);
    setHasCompletedRanking(true);
    document.cookie = "hasCompletedRanking=true; path=/";
    router.push('/upload-notes');
  }, [setRankings, setHasCompletedRanking, router]);

  const updateRankings = useCallback((rankings: Ranking[]) => {
    rankingsRef.current = rankings;
  }, []);

  const handleTimeUp = useCallback(() => {
    setRankings(rankingsRef.current);
    setHasCompletedRanking(true);
    document.cookie = "hasCompletedRanking=true; path=/";
    router.push('/upload-notes');
  }, [setRankings, setHasCompletedRanking, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold mb-4 text-white text-center text-shadow-lg">Rankings</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <div className="mb-6">
            <Timer 
              timeRemaining={timeRemaining} 
              setTimeRemaining={setTimeRemaining} 
              onTimeUp={handleTimeUp}  
              totalTime={settings.assessment.rankingTime}
            />
          </div>
          <RankingForm settings={settings} onSubmit={handleSubmit} onChange={updateRankings} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const settings = await getSettings();
  
  const { req } = context;
  const hasCompletedAssessment = req.cookies.hasCompletedAssessment === 'true';

  if (!hasCompletedAssessment) {
    return {
      redirect: {
        destination: '/assessment',
        permanent: false,
      },
    };
  }

  return { props: { settings } };
};

export default RankingPage;