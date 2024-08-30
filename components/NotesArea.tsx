import React, { useState, useEffect } from 'react';

interface NotesAreaProps {
  onSubmit: (note: string) => void;
  onChange: (note: string) => void;
  timeRemaining: number;
}

const NotesArea: React.FC<NotesAreaProps> = ({ onSubmit, onChange, timeRemaining }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    onChange(note);
  }, [note, onChange]);

  const handleSubmit = () => {
    onSubmit(note);
    setNote('');
  };

  return (
    <div className="mt-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full h-40 p-2 bg-gray-700 text-white border border-gray-600 rounded"
        placeholder="Take notes here..."
      />
      <button
        onClick={handleSubmit}
        disabled={timeRemaining === 0}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        Submit Notes
      </button>
    </div>
  );
};

export default NotesArea;