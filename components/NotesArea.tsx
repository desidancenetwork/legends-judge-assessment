import React, { useState, useEffect } from 'react';

interface NotesAreaProps {
  onSubmit: (note: string) => void;
  onChange: (note: string) => void;
  timeRemaining: number;
  initialNote?: string;
}

const NotesArea: React.FC<NotesAreaProps> = ({ onSubmit, onChange, initialNote = '' }) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    onChange(note);
  }, [note, onChange]);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  return (
    <div className="mt-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full h-40 p-2 bg-gray-700 text-white border border-gray-600 rounded"
        placeholder="Take notes here..."
      />
    </div>
  );
};

export default NotesArea;