import { createHmac, timingSafeEqual } from 'crypto';

// Once an assessment is saved, the browser receives a short-lived signed ticket that lets it
// upload handwritten notes into that judge's folder (and nowhere else).
const TICKET_TTL_MS = 2 * 60 * 60 * 1000;

type UploadTicket = {
  folderId: string;
  baseName: string;
  expires: number;
};

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET must be set in production.');
  }
  return 'local-development-only';
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function createUploadTicket(folderId: string, baseName: string): string {
  const ticket: UploadTicket = { folderId, baseName, expires: Date.now() + TICKET_TTL_MS };
  const payload = Buffer.from(JSON.stringify(ticket)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readUploadTicket(value: string): UploadTicket | null {
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const ticket = JSON.parse(Buffer.from(payload, 'base64url').toString()) as UploadTicket;
    return ticket.expires > Date.now() ? ticket : null;
  } catch {
    return null;
  }
}
