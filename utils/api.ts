import axios from 'axios';
import { AssessmentData, AdminSettings, VideoSlot } from '../types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export const uploadVideo = async (file: File, slotId: string): Promise<VideoSlot> => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('slotId', slotId);

  try {
    const response = await axios.post('/api/admin/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout
    });

    return {
      id: response.data.video.id,
      file: null,
      url: response.data.video.publicPath,
      publicPath: response.data.video.publicPath,
      originalName: response.data.video.originalName,
      uploading: false,
      error: null,
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      throw new Error(error.response.data.message || 'Failed to upload video');
    }
    throw new Error('Failed to upload video');
  }
};

export const getUploadedVideos = async (): Promise<VideoSlot[]> => {
  try {
    const response = await axios.get('/api/admin/upload-video');
    
    if (!response.data || !Array.isArray(response.data.videos)) {
      console.error('Unexpected API response structure:', response.data);
      return [];
    }
    
    return response.data.videos.map((video: any) => ({
      id: video.id,
      file: null,
      url: video.publicPath,
      publicPath: video.publicPath,
      originalName: video.originalName,
      uploading: false,
      error: null,
    }));
  } catch (error) {
    console.error('Error fetching uploaded videos:', error);
    return [];
  }
};

export const getSettings = async (): Promise<AdminSettings> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/settings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch settings');
  }
};

export const updateSettings = async (settings: Partial<AdminSettings>): Promise<AdminSettings> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/settings`, settings);
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }
};

export const deleteExcessVideos = async (newTotalVideos: number): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/admin/delete-videos`, { newTotalVideos });
  } catch (error) {
    console.error('Error deleting excess videos:', error);
    throw new Error('Failed to delete excess videos');
  }
};

export const submitAssessment = async (assessmentData: AssessmentData, handwrittenNotes: File[]): Promise<{ folderId: string, pdfFileId: string, uploadedNoteIds: string[] }> => {
  try {
    const formData = new FormData();
    formData.append('assessmentData', JSON.stringify(assessmentData));
    
    handwrittenNotes.forEach((note, index) => {
      formData.append(`notes`, note);
    });

    const response = await axios.post(`${API_BASE_URL}/submit-assessment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error submitting assessment:', error);
    throw new Error('Failed to submit assessment');
  }
};