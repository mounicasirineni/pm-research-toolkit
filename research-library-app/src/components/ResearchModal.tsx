import { useMemo, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Marked } from 'marked';
import { ResearchPiece, ResearchType } from '../types';

const TYPE_COLORS: Record<ResearchType, { bg: string; text: string; dot: string }> = {
  'Domain Primer': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  'Company Deep Dive': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'Product Teardown': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  'Competitive Landscape': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-400' },
};

interface ResearchModalProps {
  piece: ResearchPiece;
  onClose: () => void;
}

const modalMarked = new Marked({ breaks: true });

function parseMarkdown(content: string): string {
  return modalMarked.parse(content, { async: false }) as string;
}

export default function ResearchModal({ piece, onClose }: ResearchModalProps) {
  const renderedSynthesis = useMemo(
    () => (piece.synthesis ? parseMarkdown(piece.synthesis) : ''),
    [piece.synthesis]
  );
  const renderedResearch = useMemo(
    () => (piece.full_research ? parseMarkdown(piece.full_research) : ''),
    [piece.full_research]
  );

  const colors = TYPE_COLORS[piece.type] ?? { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {piece.type}
              </span>
              {piece.date && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} strokeWidth={1.8} />
                  {piece.date}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-snug">{piece.topic}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-7">
          {piece.synthesis && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Synthesis
              </h3>
              <div
                className="text-sm text-gray-700 leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_a]:text-blue-600 [&_code]:text-rose-600 [&_code]:bg-rose-50 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-50 [&_pre]:p-3 [&_pre]:rounded-lg [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2 [&_li]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-5 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-3 [&_h4]:mb-1 [&_p]:my-2"
                dangerouslySetInnerHTML={{ __html: renderedSynthesis }}
              />
            </section>
          )}

          {piece.full_research && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Full Research
              </h3>
              <div
                className="text-sm text-gray-700 leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_a]:text-blue-600 [&_code]:text-rose-600 [&_code]:bg-rose-50 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-50 [&_pre]:p-3 [&_pre]:rounded-lg [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2 [&_li]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-50 [&_th]:text-left [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500 [&_hr]:border-gray-200 [&_hr]:my-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-5 [&_h1]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-3 [&_h4]:mb-1 [&_p]:my-2"
                dangerouslySetInnerHTML={{ __html: renderedResearch }}
              />
            </section>
          )}

          {!piece.synthesis && !piece.full_research && (
            <p className="text-sm text-gray-400 italic text-center py-8">No content available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
