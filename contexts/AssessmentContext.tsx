import React, { createContext, useContext, useState, useCallback } from 'react';
import { Ranking, VideoNote } from '../types/types';

interface AssessmentContextType {
  userInfo: { name: string; email: string } | null;
  setUserInfo: (info: { name: string; email: string } | null) => void;
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
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
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
  }, []);

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