import React, { createContext, useContext, useCallback } from 'react';
import { Ranking, VideoNote } from '../types/types';
import usePersistedState from '../hooks/usePersistedState';

interface AssessmentContextType {
  userInfo: { name: string; email: string } | null;
  setUserInfo: (info: { name: string; email: string } | null) => void;
  videoNotes: VideoNote[];
  addVideoNote: (note: VideoNote) => void;
  rankings: Ranking[];
  setRankings: (rankings: Ranking[]) => void;
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
  hasStartedAssessment: boolean;
  setHasStartedAssessment: (started: boolean) => void;
  hasCompletedAssessment: boolean;
  setHasCompletedAssessment: (completed: boolean) => void;
  hasCompletedRanking: boolean;
  setHasCompletedRanking: (completed: boolean) => void;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = usePersistedState<{ name: string; email: string } | null>('userInfo', null);
  const [videoNotes, setVideoNotes] = usePersistedState<VideoNote[]>('videoNotes', []);
  const [rankings, setRankings] = usePersistedState<Ranking[]>('rankings', []);
  const [currentVideoIndex, setCurrentVideoIndex] = usePersistedState<number>('currentVideoIndex', 0);
  const [hasStartedAssessment, setHasStartedAssessment] = usePersistedState<boolean>('hasStartedAssessment', false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = usePersistedState<boolean>('hasCompletedAssessment', false);
  const [hasCompletedRanking, setHasCompletedRanking] = usePersistedState<boolean>('hasCompletedRanking', false);

  const addVideoNote = useCallback((note: VideoNote) => {
    setVideoNotes([...videoNotes, note]);
  }, [setVideoNotes, videoNotes]);

  const resetAssessment = useCallback(() => {
    setUserInfo(null);
    setVideoNotes([]);
    setRankings([]);
    setCurrentVideoIndex(0);
    setHasStartedAssessment(false);
    setHasCompletedAssessment(false);
    setHasCompletedRanking(false);
  }, [setUserInfo, setVideoNotes, setRankings, setCurrentVideoIndex, setHasStartedAssessment, setHasCompletedAssessment, setHasCompletedRanking]);

  return (
    <AssessmentContext.Provider
      value={{
        userInfo,
        setUserInfo,
        videoNotes,
        addVideoNote,
        rankings,
        setRankings,
        currentVideoIndex,
        setCurrentVideoIndex,
        hasStartedAssessment,
        setHasStartedAssessment,
        hasCompletedAssessment,
        setHasCompletedAssessment,
        hasCompletedRanking,
        setHasCompletedRanking,
        resetAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};