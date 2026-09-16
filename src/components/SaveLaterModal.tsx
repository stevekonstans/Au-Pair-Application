import React, { useState } from 'react';
import { SaveDraftPayload, SaveDraftResponse } from '../types';
import { safeFetchJson } from '../utils/api';
import { BookmarkCheck, Mail, Copy, Check, ExternalLink, X, Sparkles, Loader2 } from 'lucide-react';

interface SaveLaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  currentStep: number;
  data: any;
  onSaveSuccess: (token: string, resumeUrl: string) => void;
}

export const SaveLaterModal: React.FC<SaveLaterModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  currentStep,
  data,
  onSaveSuccess,
}) => {
  const [email, setEmail] = useState(currentEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedResponse, setSavedResponse] = useState<SaveDraftResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const payload: SaveDraftPayload = {
        email: email.trim(),
        currentStep,
        data,
      };

      const responseData: SaveDraftResponse = await safeFetchJson('/api/applications/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setSavedResponse(responseData);
      onSaveSuccess(responseData.token, responseData.resumeUrl);
    } catch (err: any) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (savedResponse?.resumeUrl) {
      navigator.clipboard.writeText(savedResponse.resumeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!savedResponse ? (
          <div>
            <div className="flex items-center space-x-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#436ebe]/10 text-[#436ebe] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-blue-950 dark:text-blue-100">Spara och skriv klart senare</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Save progress & generate resume link</p>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Enter your email address to save your application draft. We'll generate a unique link so you can resume
              anytime from any device!
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Your Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 text-sm font-medium focus:border-blue-500 focus:outline-none transition-all"
                    required
                  />
                </div>
                {error && <p className="text-xs text-rose-500 mt-1.5 font-bold">{error}</p>}
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Avbryt (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#436ebe] hover:bg-[#375ca3] text-white text-xs font-extrabold transition-all shadow-md shadow-[#436ebe]/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sparar...</span>
                    </>
                  ) : (
                    <span>Spara framsteg</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-2 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-blue-950 dark:text-blue-100 mb-1">Framsteg Sparade! 🎉</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-5">
              Your application draft has been saved. Resume link created for{' '}
              <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-5 text-left border-2 border-slate-100 dark:border-slate-700">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">
                Your Unique Resume Link
              </span>
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono break-all text-blue-950 dark:text-blue-200">
                <span className="truncate">{savedResponse.resumeUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && <p className="text-[10px] text-emerald-500 font-bold mt-1.5">Copied to clipboard!</p>}
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={savedResponse.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-950/20"
              >
                <span>Test Resume Link in New Tab</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Fortsätt nu (Continue editing)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
