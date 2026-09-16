import React from 'react';
import { ApplicationFormData } from '../types';
import { Users, Dog, Cigarette, AlertCircle } from 'lucide-react';

interface Page4Props {
  data: ApplicationFormData;
  onChange: (field: keyof ApplicationFormData, value: any) => void;
  errors: Record<string, string>;
}

export const Page4LifestylePreferences: React.FC<Page4Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-7">
      {/* Gamified heading shown when proceeding to Page 4 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
        <span className="text-2xl select-none">😎</span>
        <div>
          <h3 className="font-extrabold text-blue-950 dark:text-blue-100 text-sm sm:text-base leading-snug">
            Awesome! 😎 You’re cruising through this like a pro. Just a few more questions about your lifestyle & preferences and you’ll be all set!
          </h3>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
            Dina preferenser hjälper oss att hitta en familj som passar din vardag och livsstil.
          </p>
        </div>
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-[#436ebe]" />
          Lifestyle & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Svara på frågorna gällande familjestruktur, husdjur och rökning.
        </p>
      </div>

      {/* 1. Would you accept a single parent family? */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Would you accept a single parent family?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            'With a single mother',
            'With a single father',
            'No',
          ].map((opt) => (
            <label
              key={opt}
              className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${
                data.singleParentFamily === opt
                  ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="singleParentFamily"
                value={opt}
                checked={data.singleParentFamily === opt}
                onChange={() => onChange('singleParentFamily', opt)}
                className="w-4 h-4 text-[#436ebe] border-slate-300 focus:ring-[#436ebe]"
              />
              <span className="ml-3 text-sm text-slate-900 dark:text-slate-200">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Would you accept a family with pets? */}
      <div className="space-y-3 pt-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Dog className="w-4 h-4 text-slate-400" />
          <span>Would you accept a family with pets?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            'Yes',
            'Yes with exceptions',
            'No',
          ].map((opt) => (
            <label
              key={opt}
              className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${
                data.familyWithPets === opt
                  ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="familyWithPets"
                value={opt}
                checked={data.familyWithPets === opt}
                onChange={() => onChange('familyWithPets', opt)}
                className="w-4 h-4 text-[#436ebe] border-slate-300 focus:ring-[#436ebe]"
              />
              <span className="ml-3 text-sm text-slate-900 dark:text-slate-200">{opt}</span>
            </label>
          ))}
        </div>

        {/* Conditional text input: If the answer is No, show a text input: Which animal don't you accept: */}
        {data.familyWithPets === 'No' && (
          <div className="mt-3 p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2 animate-fade-in">
            <label htmlFor="petsNotAccepted" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Which animal don't you accept:
            </label>
            <input
              type="text"
              id="petsNotAccepted"
              name="petsNotAccepted"
              value={data.petsNotAccepted}
              onChange={(e) => onChange('petsNotAccepted', e.target.value)}
              placeholder="e.g. Dogs, Cats, Birds, Reptiles..."
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2"
            />
          </div>
        )}
      </div>

      {/* 3. Do you smoke? */}
      <div className="space-y-3 pt-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Cigarette className="w-4 h-4 text-slate-400" />
          <span>Do you smoke?</span>
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {['Yes', 'No'].map((opt) => (
            <label
              key={opt}
              className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer transition-all text-center ${
                data.smoke === opt
                  ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="smoke"
                value={opt}
                checked={data.smoke === opt}
                onChange={() => onChange('smoke', opt)}
                className="sr-only"
              />
              <span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span>
            </label>
          ))}
        </div>

        {/* Conditional number input: If Yes, show a number input: cigarettes per day: */}
        {data.smoke === 'Yes' && (
          <div className="mt-3 p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2 animate-fade-in max-w-sm">
            <label htmlFor="cigarettesPerDay" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              cigarettes per day:
            </label>
            <input
              type="number"
              min="0"
              id="cigarettesPerDay"
              name="cigarettesPerDay"
              value={data.cigarettesPerDay}
              onChange={(e) => onChange('cigarettesPerDay', e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-lg text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2"
            />
          </div>
        )}
      </div>
    </div>
  );
};
