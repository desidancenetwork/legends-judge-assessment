import type { NextApiRequest, NextApiResponse } from 'next';
import { createFolder, uploadFileToDrive } from '../../utils/googleDrive';
import { AssessmentData } from '../../types/types';
// @ts-ignore
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

function generatePDF(data: AssessmentData): Buffer {
  const doc = new jsPDF();
  
  // Add a title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80); // Dark blue color
  doc.text('Assessment Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
  
  // Add user information
  doc.setFontSize(11);
  doc.setTextColor(52, 73, 94); // Slightly lighter blue
  doc.text(`Name: ${data.userInfo.name}    Email: ${data.userInfo.email}`, 14, 25);
  
  // Function to add table title
  const addTableTitle = (title: string, y: number) => {
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text(title, 14, y);
    return y + 8; // Return the Y position after the title
  };

  // Add video notes table title
  let yPosition = addTableTitle('Video Notes', 35);
  
  // Add video notes table
  (doc as any).autoTable({
    head: [['Video', 'Notes']],
    body: data.videoNotes.map((note, index) => [
      `Video ${index + 1}`,
      note.note
    ]),
    startY: yPosition,
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 250, 254] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 'auto' }
    },
    styles: { overflow: 'linebreak', cellPadding: 4, fontSize: 10 },
    margin: { top: 30 },
  });
  
  // Get the Y position after the video notes table
  const finalY = (doc as any).lastAutoTable.finalY || yPosition;
  
  // Add rankings table title
  yPosition = addTableTitle('Rankings', finalY + 10);
  
  // Add rankings table
  (doc as any).autoTable({
    head: [['Rank', 'Team', 'Justification']],
    body: data.rankings.map((ranking, index) => [
      (index + 1).toString(),
      ranking.team,
      ranking.justification
    ]),
    startY: yPosition,
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 250, 254] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 30 },
      2: { cellWidth: 'auto' }
    },
    styles: { overflow: 'linebreak', cellPadding: 4, fontSize: 10 },
    margin: { top: 30 },
  });
  
  // Add a footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable();

  try {
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    let assessmentDataString: string;

    if (Array.isArray(fields.assessmentData)) {
      assessmentDataString = fields.assessmentData[0];
    } else if (typeof fields.assessmentData === 'string') {
      assessmentDataString = fields.assessmentData;
    } else {
      throw new Error('Assessment data is missing or in an incorrect format');
    }

    const assessmentData: AssessmentData = JSON.parse(assessmentDataString);

    const handwrittenNotes = files.notes ? (Array.isArray(files.notes) ? files.notes : [files.notes]) : [];

    // Create a folder for the user
    const folderName = `${assessmentData.userInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    const folderId = await createFolder(folderName);

    // Generate and upload PDF report
    const pdfBuffer = generatePDF(assessmentData);
    const pdfFileId = await uploadFileToDrive(
      pdfBuffer,
      `${assessmentData.userInfo.name.replace(/\s+/g, '_')}_assessment.pdf`,
      'application/pdf',
      folderId
    );

    // Upload handwritten notes if any
    const uploadedNoteIds = await Promise.all(
      handwrittenNotes.map(async (note: formidable.File, index: number) => {
        const content = await fs.readFile(note.filepath);
        const noteId = await uploadFileToDrive(
          content,
          `${assessmentData.userInfo.name.replace(/\s+/g, '_')}handwritten_note${index}.png`,
          note.mimetype || 'image/png',
          folderId
        );
        await fs.unlink(note.filepath);
        return noteId;
      })
    );

    res.status(200).json({ 
      message: 'Assessment submitted successfully', 
      folderId, 
      pdfFileId, 
      uploadedNoteIds 
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Error submitting assessment', error: JSON.stringify(error, Object.getOwnPropertyNames(error)) });
  }
}