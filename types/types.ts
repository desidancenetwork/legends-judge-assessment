export type UserInfo = {
  name: string;
  email: string;
};

export type RegistrationFormValues = {
  name: string;
  email: string;
  confirmEmail: string;
};

export type VideoNote = {
  videoId: number;
  note: string;
};

export type Ranking = {
  id: string;
  team: string;
  rank: string;
  justification: string;
};

export type AssessmentData = {
  userInfo: UserInfo;
  videoNotes: VideoNote[];
  rankings: Ranking[];
};

export type AdminSettings = {
  assessment: {
    /** Seconds of note-taking time after each video ends. */
    additionalTime: number;
    totalVideos: number;
    /** Seconds allowed for the ranking step. */
    rankingTime: number;
    youtubeVideoIds: string[];
  };
  googleDrive: {
    folderId: string;
  };
};
