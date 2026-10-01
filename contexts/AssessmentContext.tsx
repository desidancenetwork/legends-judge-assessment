import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Ranking, UserInfo, VideoNote } from '../types/types';
import { clearFlowCookies } from '../utils/flowCookies';

interface AssessmentContextType {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo | null) => void;
  videoNotes: VideoNote[];
  addVideoNote: (note: VideoNote) => void;
  rankings: Ranking[];
  setRankings: (rankings: Ranking[]) => void;
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
  hasCompletedAssessment: boolean;
  setHasCompletedAssessment: (completed: boolean) => void;
  hasCompletedRanking: boolean;
  setHasCompletedRanking: (completed: boolean) => void;
  resetAssessment: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [videoNotes, setVideoNotes] = useState<VideoNote[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [hasCompletedRanking, setHasCompletedRanking] = useState(false);

  const addVideoNote = useCallback((note: VideoNote) => {
    setVideoNotes(prevNotes => [...prevNotes, note]);
  }, []);

  const resetAssessment = useCallback(() => {
    setUserInfo(null);
    setVideoNotes([]);
    setRankings([]);
    setCurrentVideoIndex(0);
    setHasCompletedAssessment(false);
    setHasCompletedRanking(false);
    clearFlowCookies();
  }, []);

  const value = useMemo(() => ({
    userInfo,
    setUserInfo,
    videoNotes,
    addVideoNote,
    rankings,
    setRankings,
    currentVideoIndex,
    setCurrentVideoIndex,
    hasCompletedAssessment,
    setHasCompletedAssessment,
    hasCompletedRanking,
    setHasCompletedRanking,
    resetAssessment,
  }), [userInfo, videoNotes, addVideoNote, rankings, currentVideoIndex, hasCompletedAssessment, hasCompletedRanking, resetAssessment]);

  return (
    <AssessmentContext.Provider value={value}>
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
