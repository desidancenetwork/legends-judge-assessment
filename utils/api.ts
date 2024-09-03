import axios from 'axios';
import { AssessmentData, VideoSlot } from '../types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const uploadVideo = async (file: File, slotId: string): Promise<VideoSlot> => {
  try {
    const response = await axios.post('/api/admin/upload-video', { 
      action: 'getUploadUrl',
      slotId,
      fileName: file.name,
      contentType: file.type
    });

    const { uploadUrl, pathname } = response.data;

    // Step 2: Upload the file directly to Vercel Blob
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });

    const confirmResponse = await axios.post('/api/admin/upload-video', {
      action: 'confirmUpload',
      slotId,
      fileName: pathname
    });

    const { video } = confirmResponse.data;

    return {
      id: video.id,
      file: null,
      url: video.url,
      originalName: video.originalName,
      uploading: false,
      error: null,
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error('Failed to upload video');
  }
};

export const getUploadedVideos = async (): Promise<VideoSlot[]> => {
  try {
    const response = await axios.get('/api/admin/upload-video');
    
    if (!response.data ?? !Array.isArray(response.data.videos)) {
      console.error('Unexpected API response structure:', response.data);
      return [];
    }
    
    return response.data.videos.map((video: any) => ({
      id: video.id,
      file: null,
      url: video.url,
      originalName: video.originalName,
      uploading: false,
      error: null,
    }));
  } catch (error) {
    console.error('Error fetching uploaded videos:', error);
    return [];
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