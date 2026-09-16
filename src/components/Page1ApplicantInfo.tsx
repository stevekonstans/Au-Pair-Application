import React from 'react';
import { ApplicationFormData } from '../types';
import { User, Mail, Phone, Calendar, Globe, Flag } from 'lucide-react';

interface Page1Props {
  data: ApplicationFormData;
  onChange: (field: keyof ApplicationFormData, value: any) => void;
  errors: Record<string, string>;
}

export const Page1ApplicantInfo: React.FC<Page1Props> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#436ebe]" />
          Applicant Information
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fyll i dina person- och kontaktuppgifter nedan. Fält markerade med <span className="text-rose-500 font-bold">*</span> är obligatoriska.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Full Name: * */}
        <div className={`md:col-span-2 ${errors.fullName ? 'has-error' : ''}`}>
          <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Full Name: <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={data.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="e.g. Anna Svensson"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border ${
                errors.fullName
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe]'
              } rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all`}
            />
          </div>
          {errors.fullName && <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.fullName}</p>}
        </div>

        {/* Date of birth: * */}
        <div className={`md:col-span-2 sm:md:col-span-1 ${errors.dateOfBirth ? 'has-error' : ''}`}>
          <label htmlFor="dateOfBirth" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Date of birth: <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={data.dateOfBirth}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border ${
                errors.dateOfBirth
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe]'
              } rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all`}
            />
          </div>
          {errors.dateOfBirth && <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.dateOfBirth}</p>}
        </div>

        {/* Phone: * */}
        <div className={`md:col-span-2 sm:md:col-span-1 ${errors.phone ? 'has-error' : ''}`}>
          <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Phone: <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="e.g. +46 70 123 45 67"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border ${
                errors.phone
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe]'
              } rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all`}
            />
          </div>
          {errors.phone && <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.phone}</p>}
        </div>

        {/* Email: * */}
        <div className={errors.email ? 'has-error' : ''}>
          <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Email: <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="e.g. anna.svensson@gmail.com"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border ${
                errors.email
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe]'
              } rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all`}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.email}</p>}
        </div>

        {/* Bekräfta Email: * */}
        <div className={errors.confirmEmail ? 'has-error' : ''}>
          <label htmlFor="confirmEmail" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Bekräfta Email: <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              id="confirmEmail"
              name="confirmEmail"
              value={data.confirmEmail}
              onChange={(e) => onChange('confirmEmail', e.target.value)}
              placeholder="Repeat your email"
              className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border ${
                errors.confirmEmail
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe]'
              } rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all`}
            />
          </div>
          {errors.confirmEmail && <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.confirmEmail}</p>}
        </div>

        {/* Country: */}
        <div>
          <label htmlFor="country" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Country:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="country"
              name="country"
              value={data.country}
              onChange={(e) => onChange('country', e.target.value)}
              placeholder="e.g. Sweden"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all"
            />
          </div>
        </div>

        {/* Nationality: */}
        <div>
          <label htmlFor="nationality" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Nationality:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Flag className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={data.nationality}
              onChange={(e) => onChange('nationality', e.target.value)}
              placeholder="e.g. Swedish"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all"
            />
          </div>
        </div>

        {/* Gender: */}
        <div className="md:col-span-2">
          <label htmlFor="gender" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Gender:
          </label>
          <select
            id="gender"
            name="gender"
            value={data.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-[#436ebe] focus:ring-[#436ebe] rounded-xl text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 transition-all cursor-pointer"
          >
            <option value="">Välj kön / Select gender...</option>
            <option value="Female">Female / Kvinna</option>
            <option value="Male">Male / Man</option>
            <option value="Non-binary">Non-binary / Ickebinär</option>
            <option value="Prefer not to say">Prefer not to say / Vill ej uppge</option>
          </select>
        </div>
      </div>
    </div>
  );
};
