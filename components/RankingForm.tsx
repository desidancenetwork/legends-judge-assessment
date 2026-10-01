import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAssessment } from '../contexts/AssessmentContext';
import { Ranking } from '../types/types';
import { MAX_JUSTIFICATION_LENGTH } from '../utils/constants';

interface RankingFormProps {
  onSubmit: (rankings: Ranking[]) => void;
  /** Called with the latest rankings after every reorder or edit. */
  onChange: (rankings: Ranking[]) => void;
}

interface RankingItemProps {
  ranking: Ranking;
  index: number;
  videoNote: string;
  isNotesExpanded: boolean;
  isJustificationExpanded: boolean;
  onToggleNotes: (id: string) => void;
  onToggleJustification: (id: string) => void;
  onJustificationChange: (id: string, value: string) => void;
}

const RankingItem: React.FC<RankingItemProps> = React.memo(({
  ranking,
  index,
  videoNote,
  isNotesExpanded,
  isJustificationExpanded,
  onToggleNotes,
  onToggleJustification,
  onJustificationChange,
}) => (
  <Draggable draggableId={ranking.id} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`p-4 bg-gray-700 bg-opacity-50 rounded-lg mb-4 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
      >
        <div className="flex items-center mb-2">
          <div {...provided.dragHandleProps} className="mr-2 cursor-grab" aria-label={`Reorder ${ranking.team}`}>
            <GripVertical size={20} className="text-gray-400" />
          </div>
          <span className="text-xl font-bold text-white mr-4">{ranking.rank}</span>
          <h3 className="text-lg font-semibold text-white">{ranking.team}</h3>
        </div>

        <div className="mt-2">
          <button
            type="button"
            onClick={() => onToggleNotes(ranking.id)}
            aria-expanded={isNotesExpanded}
            className="w-full text-left text-white p-2 bg-gray-600 rounded-t-lg flex justify-between items-center"
          >
            <span>Notes</span>
            {isNotesExpanded ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />}
          </button>
          {isNotesExpanded && (
            <div className="p-2 bg-gray-600 bg-opacity-50 rounded-b-lg">
              <textarea
                value={videoNote}
                readOnly
                className="w-full h-24 p-2 bg-gray-500 bg-opacity-50 text-white border border-gray-600 rounded"
              />
            </div>
          )}
        </div>

        <div className="mt-2">
          <button
            type="button"
            onClick={() => onToggleJustification(ranking.id)}
            aria-expanded={isJustificationExpanded}
            className="w-full text-left text-white p-2 bg-gray-600 rounded-t-lg flex justify-between items-center"
          >
            <span>Justification</span>
            {isJustificationExpanded ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />}
          </button>
          {isJustificationExpanded && (
            <div className="p-2 bg-gray-600 bg-opacity-50 rounded-b-lg">
              <textarea
                value={ranking.justification}
                onChange={(e) => onJustificationChange(ranking.id, e.target.value)}
                maxLength={MAX_JUSTIFICATION_LENGTH}
                placeholder={`Please justify your ranking for ${ranking.team}`}
                className="w-full h-24 p-2 bg-gray-500 bg-opacity-50 text-white border border-gray-600 rounded placeholder-gray-400"
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {ranking.justification.length} / {MAX_JUSTIFICATION_LENGTH} characters
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </Draggable>
));

RankingItem.displayName = 'RankingItem';

const toggle = (ids: Set<string>, id: string) => {
  const next = new Set(ids);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
};

const RankingForm: React.FC<RankingFormProps> = ({ onSubmit, onChange }) => {
  const { videoNotes } = useAssessment();
  const [rankings, setRankings] = useState<Ranking[]>(() =>
    videoNotes.map((_, index) => ({
      id: `ranking-${index}`,
      team: `Team ${index + 1}`,
      rank: (index + 1).toString(),
      justification: '',
    }))
  );
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(() => new Set());
  const [expandedJustifications, setExpandedJustifications] = useState<Set<string>>(
    () => new Set(rankings.map((ranking) => ranking.id))
  );
  const [error, setError] = useState('');

  // Keep the page in sync so an auto-submit at time-up includes everything typed so far.
  useEffect(() => {
    onChange(rankings);
  }, [rankings, onChange]);

  const toggleNotes = useCallback((id: string) => setExpandedNotes((prev) => toggle(prev, id)), []);
  const toggleJustification = useCallback((id: string) => setExpandedJustifications((prev) => toggle(prev, id)), []);

  const handleJustificationChange = useCallback((id: string, value: string) => {
    setError('');
    setRankings((prev) => prev.map((ranking) => (ranking.id === id ? { ...ranking, justification: value } : ranking)));
  }, []);

  const onDragEnd = useCallback(({ source, destination }: DropResult) => {
    if (!destination) {
      return;
    }
    setRankings((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      return reordered.map((ranking, index) => ({ ...ranking, rank: (index + 1).toString() }));
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = rankings.filter((ranking) => !ranking.justification.trim());
    if (missing.length > 0) {
      setError(`Please add a justification for ${missing.map((ranking) => ranking.team).join(', ')} before submitting.`);
      setExpandedJustifications((prev) => new Set([...prev, ...missing.map((ranking) => ranking.id)]));
      return;
    }
    onSubmit(rankings);
  };

  return (
    <div className="space-y-8">
      <p className="text-white p-2 rounded-lg mb-1 font-semibold">Please drag and drop the rankings in your desired order.</p>
      <form onSubmit={handleSubmit}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="rankings">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {rankings.map((ranking, index) => (
                  <RankingItem
                    key={ranking.id}
                    ranking={ranking}
                    index={index}
                    videoNote={videoNotes[Number(ranking.id.split('-')[1])]?.note ?? ''}
                    isNotesExpanded={expandedNotes.has(ranking.id)}
                    isJustificationExpanded={expandedJustifications.has(ranking.id)}
                    onToggleNotes={toggleNotes}
                    onToggleJustification={toggleJustification}
                    onJustificationChange={handleJustificationChange}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {error && <p className="mt-4 text-center text-sm text-red-400" role="alert">{error}</p>}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(RankingForm);
