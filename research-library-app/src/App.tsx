import { useEffect, useState, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { ResearchPiece, ResearchType, RESEARCH_TYPES } from './types';
import ResearchCard from './components/ResearchCard';
import ResearchModal from './components/ResearchModal';

type FilterTab = 'All' | ResearchType;
const FILTER_TABS: FilterTab[] = ['All', ...RESEARCH_TYPES];

export default function App() {
  const [pieces, setPieces] = useState<ResearchPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [modalPiece, setModalPiece] = useState<ResearchPiece | null>(null);

  const fetchPieces = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('research_pieces')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error || !data) return;
    setPieces(data as ResearchPiece[]);
  }, []);

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  const filteredPieces =
    activeFilter === 'All' ? pieces : pieces.filter((p) => p.type === activeFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              PM Research Library
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              The Why Behind The What
            </p>
          </div>

          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-0.5 scrollbar-hide">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                  activeFilter === tab
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredPieces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-base font-medium text-gray-700">No research pieces found</p>
            <p className="mt-1 text-sm text-gray-400">
              {activeFilter === 'All'
                ? 'No research pieces have been added yet.'
                : `No "${activeFilter}" pieces found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPieces.map((piece) => (
              <ResearchCard
                key={piece.id}
                piece={piece}
                onExpand={(p) => setModalPiece(p)}
              />
            ))}
          </div>
        )}
      </main>

      {modalPiece && (
        <ResearchModal
          piece={modalPiece}
          onClose={() => setModalPiece(null)}
        />
      )}
    </div>
  );
}
