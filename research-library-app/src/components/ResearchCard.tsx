import { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Marked } from 'marked';

const cardMarked = new Marked({ breaks: true });
import { ResearchPiece, ResearchType } from '../types';

const TYPE_COLORS: Record<ResearchType, { bg: string; text: string; dot: string }> = {
  'Domain Primer': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  'Company Deep Dive': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  'Product Teardown': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  'Competitive Landscape': {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
  },
};

interface ResearchCardProps {
  piece: ResearchPiece;
  onExpand: (piece: ResearchPiece) => void;
}

export default function ResearchCard({ piece, onExpand }: ResearchCardProps) {
  const renderedSynthesis = useMemo(
    () => (piece.synthesis ? (cardMarked.parse(piece.synthesis, { async: false }) as string) : ''),
    [piece.synthesis]
  );
  const colors = TYPE_COLORS[piece.type] ?? {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200 flex flex-col cursor-pointer"
      onClick={() => onExpand(piece)}
    >
      <div className="px-5 pt-5 pb-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {piece.type}
          </span>
          {piece.date && (
            <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
              <Calendar size={11} strokeWidth={1.8} />
              {piece.date}
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-gray-900 leading-snug mb-3">
          {piece.topic}
        </h3>

        {piece.synthesis ? (
          <div className="relative flex-1">
            <div
              className="text-sm text-gray-500 leading-relaxed line-clamp-4 overflow-hidden [&_strong]:font-semibold [&_strong]:text-gray-700 [&_em]:italic [&_a]:text-blue-600 [&_code]:text-rose-600 [&_code]:bg-rose-50 [&_code]:px-1 [&_code]:rounded [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-1 [&_li]:mb-0 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-gray-700 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-gray-700 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_p]:my-1"
              dangerouslySetInnerHTML={{ __html: renderedSynthesis }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No synthesis available</p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
        <span className="text-xs text-gray-400 font-medium">
          {piece.full_research ? 'Click to view full research' : 'No full research attached'}
        </span>
      </div>
    </div>
  );
}
