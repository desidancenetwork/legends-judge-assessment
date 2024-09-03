import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { list, del } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = (await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end', () => {
        resolve(JSON.parse(data));
      });
      req.on('error', reject);
    })) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname: string) => {
        // Here you can implement additional checks if needed
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
          tokenPayload: JSON.stringify({
            userEmail: session.user?.email,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('blob upload completed', blob, tokenPayload);

        try {
          // Delete existing video for this slot, if any
          const { blobs } = await list();
          const slotId = blob.pathname.split('_')[0].replace('video', '');
          const existingBlob = blobs.find(b => b.pathname.startsWith(`video${slotId}_`));
          if (existingBlob && existingBlob.url !== blob.url) {
            await del(existingBlob.url);
          }

          // Here you can update your database or perform any other necessary actions
          // For example:
          // const { userEmail } = JSON.parse(tokenPayload);
          // await db.update({ videoUrl: blob.url, userEmail });
        } catch (error) {
          console.error('Error in onUploadCompleted:', error);
        }
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}