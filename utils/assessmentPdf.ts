import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { AssessmentData } from '../types/types';

const HEADER_COLOR: [number, number, number] = [41, 128, 185];
const STRIPE_COLOR: [number, number, number] = [245, 250, 254];
const TABLE_STYLES = { overflow: 'linebreak', cellPadding: 4, fontSize: 10 } as const;

export function generateAssessmentPdf(data: AssessmentData, submittedAt = new Date()): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // autoTable records where the last table ended on the document.
  const tableEnd = () => (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 0;

  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text('Assessment Report', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(52, 73, 94);
  doc.text(`Name: ${data.userInfo.name}    Email: ${data.userInfo.email}`, 14, 25);
  doc.text(`Submitted: ${submittedAt.toUTCString()}`, 14, 31);

  const addSectionTitle = (title: string, y: number) => {
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text(title, 14, y);
    return y + 8;
  };

  autoTable(doc, {
    head: [['Video', 'Notes']],
    body: data.videoNotes.map((note, index) => [`Video ${index + 1}`, note.note]),
    startY: addSectionTitle('Video Notes', 41),
    headStyles: { fillColor: HEADER_COLOR, textColor: 255 },
    alternateRowStyles: { fillColor: STRIPE_COLOR },
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 'auto' } },
    styles: TABLE_STYLES,
    margin: { top: 30 },
  });

  autoTable(doc, {
    head: [['Rank', 'Team', 'Justification']],
    body: data.rankings.map((ranking, index) => [String(index + 1), ranking.team, ranking.justification]),
    startY: addSectionTitle('Rankings', tableEnd() + 10),
    headStyles: { fillColor: HEADER_COLOR, textColor: 255 },
    alternateRowStyles: { fillColor: STRIPE_COLOR },
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 30 }, 2: { cellWidth: 'auto' } },
    styles: TABLE_STYLES,
    margin: { top: 30 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return Buffer.from(doc.output('arraybuffer'));
}
