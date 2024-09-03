import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAssessment } from '../contexts/AssessmentContext';
import { Ranking, AdminSettings } from '../types/types';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface RankingFormProps {
  settings: AdminSettings;
  onSubmit: (rankings: Ranking[]) => void;
  onChange: (rankings: Ranking[]) => void;
}

interface RankingItemProps {
  ranking: Ranking;
  index: number;
  videoNote: string;
  isNotesExpanded: boolean;
  isJustificationExpanded: boolean;
  onToggleNotes: () => void;
  onToggleJustification: () => void;
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
}) => {
  const handleJustificationChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onJustificationChange(ranking.id, e.target.value);
  }, [ranking.id, onJustificationChange]);

  return (
    <Draggable draggableId={ranking.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-4 bg-gray-700 bg-opacity-50 rounded-lg mb-4 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <div className="flex items-center mb-2">
            <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
              <GripVertical size={20} className="text-gray-400" />
            </div>
            <span className="text-xl font-bold text-white mr-4">{ranking.rank}</span>
            <h3 className="text-lg font-semibold text-white">{ranking.team}</h3>
          </div>
          
          <div className="mt-2">
            <button
              type="button"
              onClick={onToggleNotes}
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
              onClick={onToggleJustification}
              className="w-full text-left text-white p-2 bg-gray-600 rounded-t-lg flex justify-between items-center"
            >
              <span>Justification</span>
              {isJustificationExpanded ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />}
            </button>
            {isJustificationExpanded && (
              <div className="p-2 bg-gray-600 bg-opacity-50 rounded-b-lg">
                <textarea
                  value={ranking.justification}
                  onChange={handleJustificationChange}
                  placeholder={`Please justify your ranking for ${ranking.team}`}
                  className="w-full h-24 p-2 bg-gray-500 bg-opacity-50 text-white border border-gray-600 rounded placeholder-gray-400"
                />
                <div className="text-right text-sm text-gray-400 mt-1">
                  {ranking.justification.length} / 1500 characters
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}, (prevProps, nextProps) => {
  return prevProps.ranking === nextProps.ranking &&
         prevProps.index === nextProps.index &&
         prevProps.videoNote === nextProps.videoNote &&
         prevProps.isNotesExpanded === nextProps.isNotesExpanded &&
         prevProps.isJustificationExpanded === nextProps.isJustificationExpanded;
});

RankingItem.displayName = 'RankingItem';

const RankingForm: React.FC<RankingFormProps> = ({ settings, onSubmit, onChange }) => {
  const { videoNotes } = useAssessment();
  const [rankings, setRankings] = useState<Ranking[]>(() =>
    Array.from({ length: videoNotes.length }, (_, index) => ({
      id: `ranking-${index}`,
      team: `Team ${index + 1}`,
      rank: (index + 1).toString(),
      justification: '',
    }))
  );
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [expandedJustifications, setExpandedJustifications] = useState<Set<string>>(() => 
    new Set(rankings.map(ranking => ranking.id))
  );

  const rankingsRef = useRef(rankings);
  useEffect(() => {
    rankingsRef.current = rankings;
  }, [rankings]);

  const toggleNotes = useCallback((id: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleJustification = useCallback((id: string) => {
    setExpandedJustifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleJustificationChange = useCallback((id: string, value: string) => {
    setRankings(prev => prev.map(ranking => 
      ranking.id === id ? { ...ranking, justification: value.slice(0, 1500) } : ranking
    ));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rankingsRef.current);
  }, [onSubmit]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    setRankings(prev => {
      const newRankings = Array.from(prev);
      const [reorderedItem] = newRankings.splice(result.source.index, 1);
      newRankings.splice(result.destination!.index, 0, reorderedItem);

      const updatedRankings = newRankings.map((ranking, index) => ({
        ...ranking,
        rank: (index + 1).toString(),
      }));

      onChange(updatedRankings);
      return updatedRankings;
    });
  }, [onChange]);

  const memoizedRankings = useMemo(() => rankings, [rankings]);

  return (
    <div className="space-y-8">
      <p className="text-white p-2 rounded-lg mb-1 font-semibold">Please drag and drop the rankings in your desired order.</p>
      <form onSubmit={handleSubmit}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="rankings">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {memoizedRankings.map((ranking, index) => (
                  <RankingItem
                    key={ranking.id}
                    ranking={ranking}
                    index={index}
                    videoNote={videoNotes[parseInt(ranking.id.split('-')[1])]?.note ?? ''}
                    isNotesExpanded={expandedNotes.has(ranking.id)}
                    isJustificationExpanded={expandedJustifications.has(ranking.id)}
                    onToggleNotes={() => toggleNotes(ranking.id)}
                    onToggleJustification={() => toggleJustification(ranking.id)}
                    onJustificationChange={handleJustificationChange}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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