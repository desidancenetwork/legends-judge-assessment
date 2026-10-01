import React, { useState } from 'react';

interface NotesAreaProps {
  onChange: (note: string) => void;
}

const NotesArea: React.FC<NotesAreaProps> = ({ onChange }) => {
  const [note, setNote] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="mt-4">
      <textarea
        value={note}
        onChange={handleChange}
        aria-label="Notes"
        className="w-full h-48 p-2 bg-gray-700 text-white border border-gray-600 rounded"
        placeholder="Take notes here..."
      />
    </div>
  );
};

export default NotesArea;
