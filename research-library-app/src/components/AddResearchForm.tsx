import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NewResearchPiece, ResearchPiece, RESEARCH_TYPES } from '../types';

interface AddResearchFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editPiece?: ResearchPiece;
}

const EMPTY_FORM: NewResearchPiece = {
  type: 'Domain Primer',
  topic: '',
  date: '',
  synthesis: '',
  full_research: '',
};

const SOURCES_HEADING_RE = /^(works cited|sources|references)\s*$/im;

function extractSources(text: string): { bodyText: string; sourcesText: string } {
  const match = SOURCES_HEADING_RE.exec(text);
  if (!match || match.index === undefined) return { bodyText: text, sourcesText: '' };
  const bodyText = text.slice(0, match.index).trimEnd();
  const sourcesText = text.slice(match.index);
  return { bodyText, sourcesText };
}

function preprocessCitations(text: string): string {
  return text.replace(/([a-zA-Z"')]\.)(\d+)/g, '$1[$2]');
}

function formatSources(sources: string): string {
  const lines = sources.split('\n');
  let counter = 1;
  return lines.map(line => {
    const stripped = line.replace(/^\d+[\.\)]\s*/, '').trim();
    if (stripped.length > 20) {
      return `${counter++}. ${stripped}`;
    }
    return line;
  }).join('\n');
}



export default function AddResearchForm({ onClose, onSuccess, editPiece }: AddResearchFormProps) {
  const [form, setForm] = useState<NewResearchPiece>(
    editPiece
      ? {
          type: editPiece.type,
          topic: editPiece.topic,
          date: editPiece.date,
          synthesis: editPiece.synthesis,
          full_research: editPiece.full_research,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashField, setFlashField] = useState<'synthesis' | 'full_research' | null>(null);
  const [formattingField, setFormattingField] = useState<'synthesis' | 'full_research' | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = async (field: 'synthesis' | 'full_research') => {
    const value = form[field].trim();
    if (!value) return;

    const { bodyText: rawBodyText, sourcesText: rawSourcesText } = extractSources(value);
    console.log('SOURCES EXTRACTED:', rawSourcesText.substring(0, 500));
    const bodyText = preprocessCitations(rawBodyText);
    console.log('BODY PREVIEW:', bodyText.substring(0, 200));
    const sourcesText = rawSourcesText
      ? '## Sources\n\n' + formatSources(
          rawSourcesText
            .replace(/^works cited\n?/i, '')
            .replace(/^sources\n?/i, '')
            .trim()
        )
      : '';
    setFormattingField(field);

let formattedBody = '';
if (bodyText.length <= 8000) {
  const { data, error: fnError } = await supabase.functions.invoke('format-research', {
    body: { rawText: bodyText },
  });
  if (fnError || !data?.text) {
    console.error('Edge function error:', fnError, 'data:', data);
    setFormattingField(null);
    return;
  }
  formattedBody = data.text;
} else {
  const paragraphs = bodyText.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';
  for (const para of paragraphs) {
    if (current.length + para.length > 6000 && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  for (const chunk of chunks) {
    const { data, error: fnError } = await supabase.functions.invoke('format-research', {
      body: { rawText: chunk },
    });
    if (fnError || !data?.text) {
      console.error('Edge function error:', fnError, 'data:', data);
      setFormattingField(null);
      return;
    }
    formattedBody += (formattedBody ? '\n\n' : '') + data.text;
  }
}
const result = sourcesText ? `${formattedBody}\n\n${sourcesText}` : formattedBody;
    setForm((prev) => ({ ...prev, [field]: result }));
    setFormattingField(null);
    setFlashField(field);
    setTimeout(() => setFlashField(null), 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) {
      setError('Topic is required.');
      return;
    }
    setSaving(true);
    setError(null);

    let opError;
    if (editPiece) {
      const { error: updateError } = await supabase
        .from('research_pieces')
        .update(form)
        .eq('id', editPiece.id);
      opError = updateError;
    } else {
      const { error: insertError } = await supabase.from('research_pieces').insert([form]);
      opError = insertError;
    }

    setSaving(false);
    if (opError) {
      setError(opError.message);
      return;
    }
    onSuccess();
    onClose();
  };

  const isEdit = Boolean(editPiece);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Research Piece' : 'Add Research Piece'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {RESEARCH_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">Date</label>
              <input
                name="date"
                value={form.date}
                onChange={handleChange}
                placeholder="e.g. Mar 2025"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              name="topic"
              value={form.topic}
              onChange={handleChange}
              placeholder="e.g. Fintech, Healthcare, E-commerce"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-700">Synthesis</label>
              {formattingField === 'synthesis' && (
                <span className="text-xs text-gray-400 italic">Formatting...</span>
              )}
            </div>
            <textarea
              name="synthesis"
              value={form.synthesis}
              onChange={handleChange}
              onBlur={() => handleBlur('synthesis')}
              rows={3}
              placeholder="Key takeaways and summary of the research..."
              className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all duration-300 ${flashField === 'synthesis' ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
            />
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-gray-700">Full Research</label>
                {formattingField === 'full_research' && (
                  <span className="text-xs text-gray-400 italic">Formatting...</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Paste plain text — auto-formatted to markdown on blur
              </p>
            </div>
            <textarea
              name="full_research"
              value={form.full_research}
              onChange={handleChange}
              onBlur={() => handleBlur('full_research')}
              rows={6}
              placeholder="Detailed research notes — paste plain text or markdown..."
              className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y font-mono transition-all duration-300 ${flashField === 'full_research' ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || formattingField !== null}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Research' : 'Save Research'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
