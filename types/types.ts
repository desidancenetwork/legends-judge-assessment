export type UserInfo = {
  name: string;
  email: string;
};

export type FormData = {
  name: string;
  email: string;
  confirmEmail: string;
};
  
export type VideoNote = {
  videoId: number;
  note: string;
};

export type VideoSlot = {
  id: string;
  file: File | null;
  url: string | null;
  originalName: string | null;
  uploading: boolean;
  error: string | null;
};

export type VideoReference = {
  [key: string]: {
    fileName: string;
    publicPath: string;
  };
};
  
export type Ranking = {
  id: string
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
  appName: string;
  assessment: {
    additionalTime: number;
    totalVideos: number;
    rankingTime: number;
  };
  googleDrive: {
    folderId: string;
  };
};
  
export type AssessmentVideo = {
  id: string;
  name: string;
  source: 'local' | 'drive';
  file?: File;
  webViewLink?: string;
}