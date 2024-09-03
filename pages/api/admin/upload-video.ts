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

  if (req.method === 'GET') {
    try {
      const { blobs } = await list();
      const videos = blobs
        .filter(blob => blob.pathname.startsWith('video'))
        .map(blob => {
          const [slotId, ...rest] = blob.pathname.split('_');
          return {
            id: slotId.replace('video', ''),
            fileName: blob.pathname,
            originalName: rest.join('_'),
            url: blob.url,
          };
        });
      return res.status(200).json({ videos });
    } catch (error) {
      console.error('Error retrieving videos:', error);
      return res.status(500).json({ error: 'Failed to retrieve videos' });
    }
  } else if (req.method === 'POST') {
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
            const slotId = blob.pathname.split('_')[0].replace('video', '');
            const { blobs } = await list();
            const existingBlob = blobs.find(b => b.pathname.startsWith(`video${slotId}_`) && b.pathname !== blob.pathname);
            if (existingBlob) {
              await del(existingBlob.url);
            }
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
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}