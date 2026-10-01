import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import { useAssessment } from '../contexts/AssessmentContext';
import { useLeaveGuard } from '../hooks/useLeaveGuard';
import { CONTACT_EMAIL, MAX_NOTE_FILES } from '../utils/constants';
import { clearFlowCookies } from '../utils/flowCookies';
import { formatBytes, prepareNoteFile } from '../utils/noteFiles';

type NoteUpload = {
  key: string;
  name: string;
  status: 'preparing' | 'ready' | 'uploading' | 'uploaded' | 'failed' | 'invalid';
  blob?: Blob;
  type?: string;
  error?: string;
};

const withChanges = (key: string, changes: Partial<NoteUpload>) => (notes: NoteUpload[]) =>
  notes.map((note) => (note.key === key ? { ...note, ...changes } : note));

const UploadNotes = () => {
  const router = useRouter();
  const { userInfo, videoNotes, rankings } = useAssessment();
  const [notes, setNotes] = useState<NoteUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Set once the assessment itself is saved; lets the notes be retried without resubmitting it.
  const uploadTicketRef = useRef<string | null>(null);
  const [assessmentSaved, setAssessmentSaved] = useState(false);

  useLeaveGuard();

  useEffect(() => {
    if (!userInfo) {
      router.replace('/');
    }
  }, [userInfo, router]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';

    const added = files.map((file) => ({ file, key: `${file.name}-${file.lastModified}-${Math.random()}` }));
    setNotes((prev) => [
      ...prev,
      ...added.map(({ file, key }): NoteUpload => ({ key, name: file.name, status: 'preparing' })),
    ]);

    for (const { file, key } of added) {
      prepareNoteFile(file).then((prepared) => {
        setNotes(withChanges(key, 'error' in prepared
          ? { status: 'invalid', error: prepared.error }
          : { status: 'ready', blob: prepared.blob, type: prepared.type }));
      });
    }
  }, []);

  const removeNote = (key: string) => setNotes((prev) => prev.filter((note) => note.key !== key));

  const finish = useCallback(() => {
    clearFlowCookies();
    router.replace('/farewell');
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!userInfo) {
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      if (!uploadTicketRef.current) {
        const response = await fetch('/api/submit-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInfo, videoNotes, rankings }),
        });
        if (!response.ok) {
          throw new Error(`submit-assessment returned ${response.status}`);
        }
        uploadTicketRef.current = (await response.json()).uploadTicket;
        setAssessmentSaved(true);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError("We couldn't submit your assessment. Please check your internet connection and try again.");
      setIsSubmitting(false);
      return;
    }

    const ticket = uploadTicketRef.current;
    let failures = 0;
    for (const [index, note] of notes.entries()) {
      if ((note.status !== 'ready' && note.status !== 'failed') || !note.blob || !note.type || !ticket) {
        continue;
      }
      setNotes(withChanges(note.key, { status: 'uploading', error: undefined }));
      try {
        // Uploaded one at a time: each request has to stay under Vercel's body size limit.
        const response = await fetch(`/api/upload-note?index=${index + 1}`, {
          method: 'POST',
          headers: { 'Content-Type': note.type, 'X-Upload-Ticket': ticket },
          body: note.blob,
        });
        if (!response.ok) {
          throw new Error((await response.json().catch(() => null))?.message ?? `Upload failed (${response.status})`);
        }
        setNotes(withChanges(note.key, { status: 'uploaded' }));
      } catch (err) {
        failures++;
        setNotes(withChanges(note.key, { status: 'failed', error: err instanceof Error ? err.message : 'Upload failed' }));
      }
    }

    setIsSubmitting(false);
    if (failures === 0) {
      finish();
    } else {
      setError(`Your assessment was submitted, but ${failures} file${failures === 1 ? '' : 's'} didn't upload. ` +
        `Try again, or finish now and email ${failures === 1 ? 'it' : 'them'} to ${CONTACT_EMAIL}.`);
    }
  }, [userInfo, videoNotes, rankings, notes, finish]);

  const isPreparing = notes.some((note) => note.status === 'preparing');
  const hasInvalid = notes.some((note) => note.status === 'invalid');
  const pendingCount = notes.filter((note) => note.status === 'ready' || note.status === 'failed').length;
  const tooMany = notes.length > MAX_NOTE_FILES;
  const buttonText = isSubmitting
    ? 'Submitting...'
    : assessmentSaved ? 'Retry Upload' : pendingCount > 0 ? 'Upload and Finish' : 'Finish';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-pontiac mb-4 text-white text-center text-shadow-lg">Upload Handwritten Notes</h1>
        <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <p className="text-white mb-4">
            Uploading handwritten notes is optional. If you have any, you may add photos or PDFs of them here
            (up to {MAX_NOTE_FILES} files; large photos are resized automatically).
          </p>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.heic,.heif,application/pdf"
            multiple
            disabled={isSubmitting || assessmentSaved}
            className="mb-1 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />

          {notes.length > 0 && (
            <ul className="mt-4 space-y-2">
              {notes.map((note) => (
                <li key={note.key} className="flex items-center gap-3 rounded-md bg-gray-700 bg-opacity-60 px-3 py-2 text-sm">
                  {note.status === 'uploaded' && <CheckCircle2 size={18} className="shrink-0 text-green-400" />}
                  {(note.status === 'failed' || note.status === 'invalid') && <XCircle size={18} className="shrink-0 text-red-400" />}
                  {(note.status === 'preparing' || note.status === 'uploading') && <Loader2 size={18} className="shrink-0 animate-spin text-gray-300" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-white">{note.name}</p>
                    <p className={note.error ? 'text-red-300' : 'text-gray-400'}>
                      {note.error ?? (note.status === 'preparing' ? 'Preparing…' : note.blob ? formatBytes(note.blob.size) : '')}
                    </p>
                  </div>
                  {!isSubmitting && note.status !== 'uploaded' && (
                    <button type="button" onClick={() => removeNote(note.key)} aria-label={`Remove ${note.name}`} className="text-gray-400 hover:text-white">
                      <X size={18} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {tooMany && <p className="mt-4 text-sm text-red-400">Please choose at most {MAX_NOTE_FILES} files.</p>}
          {hasInvalid && (
            <p className="mt-4 text-sm text-red-400">
              Remove the files marked in red to continue. You can email them to {CONTACT_EMAIL} instead.
            </p>
          )}
          {error && <p className="mt-4 text-sm text-red-400" role="alert">{error}</p>}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isPreparing || tooMany || hasInvalid}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {buttonText}
            </button>
            {assessmentSaved && !isSubmitting && (
              <button
                onClick={finish}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition duration-150 ease-in-out"
              >
                Finish Without Them
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (req.cookies.hasCompletedRanking !== 'true') {
    return {
      redirect: {
        destination: '/assessment/ranking',
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default UploadNotes;
