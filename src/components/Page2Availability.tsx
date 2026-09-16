import React from 'react';
import { ApplicationFormData } from '../types';
import { Compass, Calendar, Clock, MapPin } from 'lucide-react';

interface Page2Props {
  data: ApplicationFormData;
  onChange: (field: keyof ApplicationFormData, value: any) => void;
  errors: Record<string, string>;
}

export const Page2Availability: React.FC<Page2Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Gamified heading shown when proceeding to Page 2 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
        <span className="text-2xl select-none">🎉</span>
        <div>
          <h3 className="font-extrabold text-blue-950 dark:text-blue-100 text-sm sm:text-base leading-snug">
            Nice one! 🎉 You’re off to a great start!
          </h3>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
            Nu ska vi kika på vart du vill åka och när du är redo för ditt äventyr.
          </p>
        </div>
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Compass className="w-6 h-6 text-[#436ebe]" />
          Availability
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Välj önskat land för din au pair-vistelse samt önskad längd och tidigaste avresedatum.
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* I’m applying to be an au pair in: — dropdown with options: Australia, Spain, Ireland, Italy, England */}
        <div>
          <label htmlFor="applyingCountry" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            I’m applying to be an au pair in:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="applyingCountry"
              name="applyingCountry"
              value={data.applyingCountry}
              onChange={(e) => onChange('applyingCountry', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all cursor-pointer"
            >
              <option value="Australia">Australia</option>
              <option value="Spain">Spain</option>
              <option value="Ireland">Ireland</option>
              <option value="Italy">Italy</option>
              <option value="England">England</option>
            </select>
          </div>
        </div>

        {/* How long would you like to stay: — text input or select */}
        <div>
          <label htmlFor="stayDuration" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            How long would you like to stay:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <select
              id="stayDuration"
              name="stayDuration"
              value={data.stayDuration}
              onChange={(e) => onChange('stayDuration', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all cursor-pointer"
            >
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="9 months">9 months</option>
              <option value="12 months">12 months</option>
              <option value="More than 12 months">More than 12 months</option>
              <option value="Flexible / Not sure yet">Flexible / Not sure yet</option>
            </select>
          </div>
        </div>

        {/* When would you like to travel at the earliest? — date input */}
        <div>
          <label htmlFor="earliestTravelDate" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            When would you like to travel at the earliest?
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              id="earliestTravelDate"
              name="earliestTravelDate"
              value={data.earliestTravelDate}
              onChange={(e) => onChange('earliestTravelDate', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
