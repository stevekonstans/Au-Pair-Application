import React from 'react';
import { ApplicationFormData, LanguageProficiency, SwimmingProficiency } from '../types';
import { Heart, Car, Languages, Waves, Check } from 'lucide-react';

interface Page3Props {
  data: ApplicationFormData;
  onChange: (field: keyof ApplicationFormData, value: any) => void;
  errors: Record<string, string>;
}

const AGE_OPTIONS = [
  'Newborn – 1 year',
  '1 - 3 years',
  '3 - 6 years',
  '6 - 9 years',
  '9+ years',
  'Children with disabilities',
];

const NUM_CHILDREN_OPTIONS = [
  'I’m flexible',
  '1 – 2 children',
  '1 – 3 children',
  '3 – 4 children',
  '4+ children',
];

const PROFICIENCY_OPTIONS: { value: LanguageProficiency; label: string }[] = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
  { value: 'None', label: 'None' },
];

const SWIMMING_OPTIONS: { value: SwimmingProficiency; label: string }[] = [
  { value: 'Excellent', label: 'Excellent' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
  { value: 'Poor', label: 'Poor' },
  { value: "I can't swim", label: "I can't swim" },
];

export const Page3ChildcareExperience: React.FC<Page3Props> = ({ data, onChange }) => {
  const toggleAgeExperience = (option: string) => {
    const current = data.childcareAgeExperience || [];
    if (current.includes(option)) {
      onChange('childcareAgeExperience', current.filter((item) => item !== option));
    } else {
      onChange('childcareAgeExperience', [...current, option]);
    }
  };

  const toggleNumChildren = (option: string) => {
    const current = data.numberOfChildren || [];
    if (current.includes(option)) {
      onChange('numberOfChildren', current.filter((item) => item !== option));
    } else {
      onChange('numberOfChildren', [...current, option]);
    }
  };

  return (
    <div className="space-y-7">
      {/* Gamified heading shown when proceeding to Page 3 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
        <span className="text-2xl select-none">🚴♀️</span>
        <div>
          <h3 className="font-extrabold text-blue-950 dark:text-blue-100 text-sm sm:text-base leading-snug">
            Let families see the real you – your hobbies and passions help us match you with your perfect fam! 🚴♀️🎶🏓
          </h3>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
            Dina erfarenheter med barn, språkkunskaper och färdigheter gör det enkelt att hitta rätt familj.
          </p>
        </div>
      </div>

      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Heart className="w-6 h-6 text-[#436ebe]" />
          Your Childcare Experience & Skills
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Berätta om din erfarenhet av barnomsorg, körkort, språk samt simkunnighet.
        </p>
      </div>

      {/* 1. Experience with children ages: */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Experience with children ages:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AGE_OPTIONS.map((age) => {
            const checked = (data.childcareAgeExperience || []).includes(age);
            return (
              <label
                key={age}
                className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${
                  checked
                    ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAgeExperience(age)}
                  className="w-4 h-4 text-[#436ebe] rounded border-slate-300 focus:ring-[#436ebe]"
                />
                <span className="ml-3 text-sm text-slate-900 dark:text-slate-200">{age}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Number of children */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Number of children (the more flexible you are the more options you will have):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {NUM_CHILDREN_OPTIONS.map((num) => {
            const checked = (data.numberOfChildren || []).includes(num);
            return (
              <label
                key={num}
                className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${
                  checked
                    ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleNumChildren(num)}
                  className="w-4 h-4 text-[#436ebe] rounded border-slate-300 focus:ring-[#436ebe]"
                />
                <span className="ml-3 text-sm text-slate-900 dark:text-slate-200">{num}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Do you have a driver’s license? */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Car className="w-4 h-4 text-slate-400" />
          <span>Do you have a driver’s license?</span>
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {['Yes', 'No'].map((opt) => (
            <label
              key={opt}
              className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer text-center transition-all ${
                data.driversLicense === opt
                  ? 'border-[#436ebe] bg-blue-50/70 dark:bg-blue-950/40 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="driversLicense"
                value={opt}
                checked={data.driversLicense === opt}
                onChange={() => onChange('driversLicense', opt)}
                className="sr-only"
              />
              <span className="text-sm text-slate-900 dark:text-slate-100">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Language Knowledge: */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-[#436ebe]" />
            <span>Language Knowledge:</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select your proficiency level for each language.
          </p>
        </div>

        {[
          { key: 'languageEnglish' as const, name: 'English' },
          { key: 'languageFrench' as const, name: 'French' },
          { key: 'languageGerman' as const, name: 'German' },
          { key: 'languageSpanish' as const, name: 'Spanish' },
        ].map((lang) => (
          <div key={lang.key} className="bg-slate-50/60 dark:bg-slate-800/40 p-3 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-200 mb-2.5">
              {lang.name}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PROFICIENCY_OPTIONS.map((prof) => {
                const isSelected = data[lang.key] === prof.value;
                return (
                  <label
                    key={prof.value}
                    className={`flex items-center justify-center py-2 px-2 border rounded-lg cursor-pointer text-xs transition-all ${
                      isSelected
                        ? 'border-[#436ebe] bg-[#436ebe] text-white font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={lang.key}
                      value={prof.value}
                      checked={isSelected}
                      onChange={() => onChange(lang.key, prof.value)}
                      className="sr-only"
                    />
                    <span>{prof.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Native language: */}
      <div className="pt-1">
        <label htmlFor="nativeLanguage" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Native language:
        </label>
        <input
          type="text"
          id="nativeLanguage"
          name="nativeLanguage"
          value={data.nativeLanguage}
          onChange={(e) => onChange('nativeLanguage', e.target.value)}
          placeholder="e.g. Swedish, Finnish, English"
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all"
        />
      </div>

      {/* 6. Describe your swimming skills: */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Waves className="w-4 h-4 text-slate-400" />
          <span>Describe your swimming skills:</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SWIMMING_OPTIONS.map((opt) => {
            const isSelected = data.swimmingSkills === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center justify-center p-3 border rounded-xl cursor-pointer text-xs text-center transition-all ${
                  isSelected
                    ? 'border-[#436ebe] bg-[#436ebe] text-white font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="swimmingSkills"
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => onChange('swimmingSkills', opt.value)}
                  className="sr-only"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
