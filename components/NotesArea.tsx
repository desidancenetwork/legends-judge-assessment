import React, { useState, useEffect } from 'react';

interface NotesAreaProps {
  onSubmit: (note: string) => void;
  onChange: (note: string) => void;
  timeRemaining: number;
}

const NotesArea: React.FC<NotesAreaProps> = ({ onSubmit, onChange }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    onChange(note);
  }, [note, onChange]);

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