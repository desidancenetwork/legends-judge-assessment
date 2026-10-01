import type { NextApiRequest, NextApiResponse } from 'next';
import { AssessmentData, Ranking, VideoNote } from '../../types/types';
import { generateAssessmentPdf } from '../../utils/assessmentPdf';
import { createFolder, safeFileName, uploadFile } from '../../utils/googleDrive';
import { getSettings } from '../../utils/settingsStore';
import { createUploadTicket } from '../../utils/uploadTicket';

// Only text is posted here; handwritten notes are uploaded separately via /api/upload-note.
export const config = {
  api: {
    bodyParser: { sizeLimit: '4mb' },
  },
};

const isString = (value: unknown, maxLength: number): value is string =>
  typeof value === 'string' && value.length <= maxLength;

function parseAssessment(body: unknown): AssessmentData | null {
  const { userInfo, videoNotes, rankings } = (body ?? {}) as Partial<Record<keyof AssessmentData, unknown>>;
  const user = (userInfo ?? {}) as Record<string, unknown>;
  if (!isString(user.name, 200) || !user.name.trim() || !isString(user.email, 320)) {
    return null;
  }
  if (!Array.isArray(videoNotes) || !Array.isArray(rankings)) {
    return null;
  }

  const notes = videoNotes as Partial<VideoNote>[];
  const ranked = rankings as Partial<Ranking>[];
  if (!notes.every((note) => typeof note?.note === 'string') ||
      !ranked.every((ranking) => typeof ranking?.team === 'string' && typeof ranking.justification === 'string')) {
    return null;
  }

  return {
    userInfo: { name: user.name.trim(), email: user.email.trim() },
    videoNotes: notes.map((note, index) => ({ videoId: index, note: note.note as string })),
    rankings: ranked.map((ranking, index) => ({
      id: String(ranking.id ?? index),
      team: ranking.team as string,
      rank: String(index + 1),
      justification: ranking.justification as string,
    })),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const assessment = parseAssessment(req.body);
  if (!assessment) {
    return res.status(400).json({ message: 'Missing or invalid assessment data' });
  }

  try {
    const { googleDrive } = await getSettings();
    const baseName = safeFileName(assessment.userInfo.name);
    const folderId = await createFolder(`${baseName}_${new Date().toISOString().split('T')[0]}`, googleDrive.folderId);
    await uploadFile(folderId, `${baseName}_assessment.pdf`, 'application/pdf', generateAssessmentPdf(assessment));

    res.status(200).json({ uploadTicket: createUploadTicket(folderId, baseName) });
  } catch (error) {
    console.error('Error in submit-assessment:', error);
    res.status(500).json({ message: 'Error submitting assessment' });
  }
}
