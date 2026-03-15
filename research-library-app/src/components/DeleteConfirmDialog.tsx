import { Trash2 } from 'lucide-react';
import { ResearchPiece } from '../types';

interface DeleteConfirmDialogProps {
  piece: ResearchPiece;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ piece, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Delete research piece?</h3>
            <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <p className="text-sm font-medium text-gray-800 leading-snug">{piece.topic}</p>
          <p className="text-xs text-gray-400 mt-0.5">{piece.type}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
