import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from './lib/supabase';
import { ResearchPiece, ResearchType, RESEARCH_TYPES } from './types';
import ResearchCard from './components/ResearchCard';
import ResearchModal from './components/ResearchModal';
import AddResearchForm from './components/AddResearchForm';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import PasswordDialog from './components/PasswordDialog';

type FilterTab = 'All' | ResearchType;
const FILTER_TABS: FilterTab[] = ['All', ...RESEARCH_TYPES];

export default function App() {
  const [pieces, setPieces] = useState<ResearchPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [modalPiece, setModalPiece] = useState<ResearchPiece | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editPiece, setEditPiece] = useState<ResearchPiece | null>(null);
  const [deletePiece, setDeletePiece] = useState<ResearchPiece | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleSecretClick = () => {
    if (isEditMode) return;
    const next = clickCount + 1;
    if (clickTimer) clearTimeout(clickTimer);
    if (next >= 5) {
      setClickCount(0);
      setShowPasswordDialog(true);
    } else {
      setClickCount(next);
      const t = setTimeout(() => setClickCount(0), 1500);
      setClickTimer(t);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-password`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.valid) {
      setIsEditMode(true);
      setShowPasswordDialog(false);
    } else {
      throw new Error('invalid');
    }
  };

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

  const handleDelete = async () => {
    if (!deletePiece) return;
    await supabase.from('research_pieces').delete().eq('id', deletePiece.id);
    setDeletePiece(null);
    fetchPieces();
  };

  const filteredPieces =
    activeFilter === 'All' ? pieces : pieces.filter((p) => p.type === activeFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                onClick={handleSecretClick}
                className="text-2xl font-bold text-gray-900 tracking-tight select-none cursor-default"
              >
                PM Research Library
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                The Why Behind The What
              </p>
            </div>
            {isEditMode && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus size={15} strokeWidth={2.2} />
                  Add New
                </button>
              </div>
            )}
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
                isEditMode={isEditMode}
                onExpand={(p) => setModalPiece(p)}
                onEdit={(p) => setEditPiece(p)}
                onDelete={(p) => setDeletePiece(p)}
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

      {isEditMode && showAddForm && (
        <AddResearchForm
          onClose={() => setShowAddForm(false)}
          onSuccess={fetchPieces}
        />
      )}

      {isEditMode && editPiece && (
        <AddResearchForm
          editPiece={editPiece}
          onClose={() => setEditPiece(null)}
          onSuccess={fetchPieces}
        />
      )}

      {isEditMode && deletePiece && (
        <DeleteConfirmDialog
          piece={deletePiece}
          onConfirm={handleDelete}
          onCancel={() => setDeletePiece(null)}
        />
      )}

      {showPasswordDialog && (
        <PasswordDialog
          onSubmit={handlePasswordSubmit}
          onCancel={() => setShowPasswordDialog(false)}
        />
      )}
    </div>
  );
}
