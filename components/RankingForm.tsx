import React, { useState, useCallback, useMemo, useEffect, useReducer } from 'react';
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
  isExpanded: boolean;
  onToggle: () => void;
  onJustificationChange: (value: string) => void;
}

const RankingItem = React.memo(({ 
  ranking, 
  index, 
  videoNote, 
  isExpanded, 
  onToggle, 
  onJustificationChange,
}: RankingItemProps) => (
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
          <div className="ml-auto flex items-center">
            <span className="text-white mr-2">Your Notes</span>
            <button
              type="button"
              onClick={onToggle}
              className="text-white"
            >
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-white mb-1">Video Notes:</h4>
            <textarea
              value={videoNote}
              readOnly
              className="w-full h-24 p-2 bg-gray-600 bg-opacity-50 text-white border border-gray-600 rounded"
            />
          </div>
        )}
        <textarea
          value={ranking.justification}
          onChange={(e) => onJustificationChange(e.target.value)}
          placeholder="Justification"
          className="w-full h-24 p-2 bg-gray-700 bg-opacity-50 text-white border border-gray-600 rounded placeholder-gray-400"
        />
      </div>
    )}
  </Draggable>
));

RankingItem.displayName = 'RankingItem';

type RankingAction = 
  | { type: 'UPDATE_RANKING'; payload: { index: number; ranking: Ranking } }
  | { type: 'REORDER_RANKINGS'; payload: Ranking[] }
  | { type: 'UPDATE_JUSTIFICATION'; payload: { index: number; justification: string } };

const rankingReducer = (state: Ranking[], action: RankingAction): Ranking[] => {
  switch (action.type) {
    case 'UPDATE_RANKING':
      return state.map((ranking, index) => 
        index === action.payload.index ? action.payload.ranking : ranking
      );
    case 'REORDER_RANKINGS':
      return action.payload.map((ranking, index) => ({
        ...ranking,
        rank: (index + 1).toString(),
      }));
    case 'UPDATE_JUSTIFICATION':
      return state.map((ranking, index) => 
        index === action.payload.index 
          ? { ...ranking, justification: action.payload.justification } 
          : ranking
      );
    default:
      return state;
  }
};

const RankingForm: React.FC<RankingFormProps> = ({ settings, onSubmit, onChange }) => {
  const { videoNotes } = useAssessment();
  const [rankings, dispatch] = useReducer(rankingReducer, 
    Array.from({ length: videoNotes.length }, (_, index) => ({
      id: `ranking-${index}`,
      team: `Team ${index + 1}`,
      rank: (index + 1).toString(),
      justification: '',
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    onChange(rankings);
  }, [rankings, onChange]);

  const handleJustificationChange = useCallback((index: number, value: string) => {
    dispatch({ type: 'UPDATE_JUSTIFICATION', payload: { index, justification: value } });
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rankings);
  }, [rankings, onSubmit]);

  const toggleNotes = useCallback((index: number) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newRankings = Array.from(rankings);
    const [reorderedItem] = newRankings.splice(result.source.index, 1);
    newRankings.splice(result.destination.index, 0, reorderedItem);

    dispatch({ type: 'REORDER_RANKINGS', payload: newRankings });
  }, [rankings]);

  const memoizedRankings = useMemo(() => rankings, [rankings]);

  return (
    <div className="space-y-8">
      <p className="text-white p-2 rounded-lg mb-1 font-semibold">Based on your judgment, drag and drop the rankings in the order you see fit.</p>
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
                    isExpanded={expandedNotes.has(index)}
                    onToggle={() => toggleNotes(index)}
                    onJustificationChange={(value) => handleJustificationChange(index, value)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {error && <p className="text-red-400 mt-4">{error}</p>}
        <button
          type="submit"
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-lg"
        >
          Submit Rankings
        </button>
      </form>
    </div>
  );
};

export default React.memo(RankingForm);