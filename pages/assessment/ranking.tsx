import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../../contexts/AssessmentContext';
import RankingForm from '../../components/RankingForm';
import Timer from '../../components/Timer';
import { Ranking, AdminSettings } from '../../types/types';
import { getServerSideSettings } from '../../utils/serverSettings';

interface RankingPageProps {
  settings: AdminSettings;
}

const RankingPage = ({ settings }: RankingPageProps) => {
  const router = useRouter();
  const { userInfo, setRankings } = useAssessment();
  const [timeRemaining, setTimeRemaining] = useState(settings.assessment.rankingTime);
  const rankingsRef = useRef<Ranking[]>([]);

  useEffect(() => {
    if (!userInfo) {
      router.push('/');
    }
  }, [userInfo, router]);

  const handleSubmit = (rankings: Ranking[]) => {
    setRankings(rankings);
    router.push('/upload-notes');
  };

  const updateRankings = (rankings: Ranking[]) => {
    rankingsRef.current = rankings;
  };

  const handleTimeUp = () => {
    // Save the current rankings
    setRankings(rankingsRef.current);
    // Redirect to the next page
    router.push('/upload-notes');
  };

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

export const getServerSideProps: GetServerSideProps = async () => {
  const settings = getServerSideSettings();
  return { props: { settings } };
};

export default RankingPage;