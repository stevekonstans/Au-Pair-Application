import React from 'react';
import { SubmissionResponse } from '../types';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface SuccessViewProps {
  response?: SubmissionResponse | null;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ response, onReset }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl max-w-2xl mx-auto space-y-6 text-center animate-fade-in">
      {/* Celebration Icon */}
      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-4">
        {/* Gamified heading requested by user */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Boom! You nailed it – all questions complete. 🥳
        </h1>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-medium space-y-3 leading-relaxed text-slate-700 dark:text-slate-300 text-center">
          <p className="font-bold text-slate-900 dark:text-white text-base">
            Tack för din ansökan! Vi har tagit emot dina uppgifter och ser fram emot att hjälpa dig ut på ditt au pair-äventyr.
          </p>
          <p>
            Vi har mejlat dig instruktioner för nästa steg. Kom ihåg att även kolla i skräpposten, ibland hamnar mejlet där!
          </p>
          <p className="font-bold text-[#436ebe] text-base pt-1">
            Din au pair-dröm kan snart bli verklighet!
          </p>
          <p className="font-black text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700 uppercase tracking-wider text-xs">
            Team Anixi
          </p>
        </div>
      </div>

      {/* Reference ID Badge if available */}
      {response?.applicationId && (
        <div className="inline-block bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 font-medium block">Ansöknings-ID</span>
          <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
            {response.applicationId}
          </span>
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Skicka en ny ansökan</span>
        </button>
      </div>
    </div>
  );
};

