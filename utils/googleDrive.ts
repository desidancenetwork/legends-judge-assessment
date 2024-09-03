import * as google from 'googleapis';
import { Readable } from 'stream';

const auth = new google.Auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_CREDENTIALS_PROJECT_ID,
    private_key_id: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_CREDENTIALS_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CREDENTIALS_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CREDENTIALS_CLIENT_ID,
    universe_domain: 'googleapis.com',
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = new google.drive_v3.Drive({ auth });

export const createFolder = async (folderName: string, parentFolderId?: string): Promise<string> => {
  try {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : [process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID ?? 'root'],
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return res.data.id!;
  } catch (err) {
    console.error('Error creating folder in Google Drive:', err);
    throw err;
  }
};

export const uploadFileToDrive = async (fileContent: Buffer, fileName: string, mimeType: string, folderId: string) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(fileContent),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    return res.data.id;
  } catch (err) {
    console.error('Error uploading file to Google Drive:', err);
    throw err;
  }
};

export const getFileFromDrive = async (fileId: string) => {
  try {
    const res = await drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' });
    return res.data;
  } catch (err) {
    console.error('Error getting file from Google Drive:', err);
    throw err;
  }
};