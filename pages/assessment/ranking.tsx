import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { useAssessment } from '../../contexts/AssessmentContext';
import RankingForm from '../../components/RankingForm';
import Timer from '../../components/Timer';
import { useLeaveGuard } from '../../hooks/useLeaveGuard';
import { Ranking } from '../../types/types';
import { setFlowCookie } from '../../utils/flowCookies';
import { getSettings } from '../../utils/settingsStore';

interface RankingPageProps {
  rankingTime: number;
}

const RankingPage = ({ rankingTime }: RankingPageProps) => {
  const router = useRouter();
  const { userInfo, setRankings, hasCompletedAssessment, setHasCompletedRanking } = useAssessment();
  const rankingsRef = useRef<Ranking[]>([]);
  const finishedRef = useRef(false);

  useLeaveGuard();

  useEffect(() => {
    if (!userInfo) {
      router.replace('/');
    } else if (!hasCompletedAssessment) {
      router.replace('/assessment');
    }
  }, [userInfo, hasCompletedAssessment, router]);

  const finish = useCallback((rankings: Ranking[]) => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    setRankings(rankings);
    setHasCompletedRanking(true);
    setFlowCookie('hasCompletedRanking');
    router.push('/upload-notes');
  }, [setRankings, setHasCompletedRanking, router]);

  const updateRankings = useCallback((rankings: Ranking[]) => {
    rankingsRef.current = rankings;
  }, []);

  const handleTimeUp = useCallback(() => finish(rankingsRef.current), [finish]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-pontiac mb-4 text-white text-center text-shadow-lg">Rankings</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <div className="mb-6">
            <Timer durationSeconds={rankingTime} onTimeUp={handleTimeUp} />
          </div>
          <RankingForm onSubmit={finish} onChange={updateRankings} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<RankingPageProps> = async ({ req }) => {
  if (req.cookies.hasCompletedAssessment !== 'true') {
    return {
      redirect: {
        destination: '/assessment',
        permanent: false,
      },
    };
  }

  const { assessment } = await getSettings();
  return { props: { rankingTime: assessment.rankingTime } };
};

export default RankingPage;
