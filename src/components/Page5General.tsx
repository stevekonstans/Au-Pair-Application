import React from 'react';
import { ApplicationFormData } from '../types';
import { ShieldCheck, HeartPulse, Sparkles, Scale, Pill } from 'lucide-react';

interface Page5Props {
  data: ApplicationFormData;
  onChange: (field: keyof ApplicationFormData, value: any) => void;
  errors: Record<string, string>;
}

export const Page5General: React.FC<Page5Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-7">
      {/* Gamified heading shown when proceeding to Page 5 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
        <span className="text-2xl select-none">💪</span>
        <div>
          <h3 className="font-extrabold text-blue-950 dark:text-blue-100 text-sm sm:text-base leading-snug">
            You’re smashing it
          </h3>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
            Sista steget! Några allmänna hälso- och trygghetsfrågor inför din placering.
          </p>
        </div>
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-[#436ebe]" />
          General
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Dessa frågor ställs för din trygghet och för att säkerställa bästa möjliga matchning med en värdfamilj.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Legal background */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-slate-400" />
            <span>Do you have anything in your legal background (such as a past offence) that we should be aware of?</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer text-center transition-all ${
                  data.legalBackground === opt
                    ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="legalBackground"
                  value={opt}
                  checked={data.legalBackground === opt}
                  onChange={() => onChange('legalBackground', opt)}
                  className="sr-only"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span>
              </label>
            ))}
          </div>
          {data.legalBackground === 'Yes' && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              <label htmlFor="legalBackgroundDetails" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Feel free to share any relevant details:
              </label>
              <textarea
                id="legalBackgroundDetails"
                name="legalBackgroundDetails"
                rows={3}
                value={data.legalBackgroundDetails}
                onChange={(e) => onChange('legalBackgroundDetails', e.target.value)}
                placeholder="Share any relevant context or details here..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 resize-y"
              />
            </div>
          )}
        </div>

        {/* 2. Chronic health */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-slate-400" />
            <span>Do you have chronic/recurring health problems (e.g. asthma, diabetes)?</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer text-center transition-all ${
                  data.chronicHealth === opt
                    ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="chronicHealth"
                  value={opt}
                  checked={data.chronicHealth === opt}
                  onChange={() => onChange('chronicHealth', opt)}
                  className="sr-only"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span>
              </label>
            ))}
          </div>
          {data.chronicHealth === 'Yes' && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              <label htmlFor="chronicHealthDetails" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Please tell us a little more (this helps us find the best family for you):
              </label>
              <textarea
                id="chronicHealthDetails"
                name="chronicHealthDetails"
                rows={3}
                value={data.chronicHealthDetails}
                onChange={(e) => onChange('chronicHealthDetails', e.target.value)}
                placeholder="Describe condition and any necessary accommodations..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 resize-y"
              />
            </div>
          )}
        </div>

        {/* 3. Counselling / Emotional wellbeing */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-slate-400" />
            <span>Have you ever received counselling or support for your emotional wellbeing?</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer text-center transition-all ${
                  data.counsellingSupport === opt
                    ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="counsellingSupport"
                  value={opt}
                  checked={data.counsellingSupport === opt}
                  onChange={() => onChange('counsellingSupport', opt)}
                  className="sr-only"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span>
              </label>
            ))}
          </div>
          {data.counsellingSupport === 'Yes' && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              <label htmlFor="counsellingSupportDetails" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Feel free to share any relevant details:
              </label>
              <textarea
                id="counsellingSupportDetails"
                name="counsellingSupportDetails"
                rows={3}
                value={data.counsellingSupportDetails}
                onChange={(e) => onChange('counsellingSupportDetails', e.target.value)}
                placeholder="Share any details or dates..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 resize-y"
              />
            </div>
          )}
        </div>

        {/* 4. Eating-related health issue */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-slate-400" />
            <span>Have you ever experienced an eating-related health issue?</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer text-center transition-all ${
                  data.eatingHealthIssue === opt
                    ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="eatingHealthIssue"
                  value={opt}
                  checked={data.eatingHealthIssue === opt}
                  onChange={() => onChange('eatingHealthIssue', opt)}
                  className="sr-only"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span>
              </label>
            ))}
          </div>
          {data.eatingHealthIssue === 'Yes' && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              <label htmlFor="eatingHealthIssueDetails" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Please give details and dates:
              </label>
              <textarea
                id="eatingHealthIssueDetails"
                name="eatingHealthIssueDetails"
                rows={3}
                value={data.eatingHealthIssueDetails}
                onChange={(e) => onChange('eatingHealthIssueDetails', e.target.value)}
                placeholder="Give details and relevant dates..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 resize-y"
              />
            </div>
          )}
        </div>

        {/* 5. Medication */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-slate-400" />
            <span>Are you currently taking any medication?</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {['Yes', 'No'].map((opt) => (
              <label
                key={opt}
                className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer text-center transition-all ${
                  data.takingMedication === opt
                    ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="takingMedication"
                  value={opt}
                  checked={data.takingMedication === opt}
                  onChange={() => onChange('takingMedication', opt)}
                  className="sr-only"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span>
              </label>
            ))}
          </div>
          {data.takingMedication === 'Yes' && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              <label htmlFor="takingMedicationDetails" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Feel free to share any relevant details:
              </label>
              <textarea
                id="takingMedicationDetails"
                name="takingMedicationDetails"
                rows={3}
                value={data.takingMedicationDetails}
                onChange={(e) => onChange('takingMedicationDetails', e.target.value)}
                placeholder="Share any medication name, dosage or details..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
