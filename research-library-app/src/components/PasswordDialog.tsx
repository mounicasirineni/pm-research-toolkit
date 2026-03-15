import { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
}

export default function PasswordDialog({ onSubmit, onCancel }: Props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await onSubmit(value);
    } catch {
      setLoading(false);
      setError(true);
      setValue('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100">
            <Lock size={16} strokeWidth={2} className="text-gray-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Enter password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Password"
            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
              error
                ? 'border-red-400 bg-red-50 focus:border-red-500'
                : 'border-gray-200 focus:border-gray-400'
            }`}
          />
          {error && (
            <p className="text-xs text-red-500 -mt-1">Incorrect password. Try again.</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !value}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Checking...' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
