import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateInputProps {
  value: string; // expected in dd/mm/yy format or empty
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  minDateIso?: string;
  id?: string;
}

export const DateInputDDMMYY: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = 'dd/mm/yy',
  error = false,
  id,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default calendar view date (year, month 0-11)
  const [viewYear, setViewYear] = useState<number>(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        let y = parseInt(parts[2], 10);
        if (!isNaN(y)) return y < 100 ? (y > 30 ? 1900 + y : 2000 + y) : y;
      }
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        let m = parseInt(parts[1], 10);
        if (!isNaN(m) && m >= 1 && m <= 12) return m - 1;
      }
    }
    return new Date().getMonth();
  });

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  // Format typed input DD/MM/YY
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.length > 6) raw = raw.slice(0, 6);

    let formatted = '';
    if (raw.length > 0) formatted = raw.slice(0, 2);
    if (raw.length >= 3) formatted += '/' + raw.slice(2, 4);
    if (raw.length >= 5) formatted += '/' + raw.slice(4, 6);

    onChange(formatted);
  };

  const handleSelectDay = (day: number) => {
    const dd = day < 10 ? `0${day}` : `${day}`;
    const m = viewMonth + 1;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const yy = String(viewYear).slice(2);
    onChange(`${dd}/${mm}/${yy}`);
    setShowCalendar(false);
  };

  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ];

  const monthDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Get starting day of week for Monday start (0 = Mon, ..., 6 = Sun)
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const yearsRange = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 70; y <= currentYear + 15; y++) {
    yearsRange.push(y);
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center w-full">
      <input
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={8}
        className={`w-full pl-10 pr-32 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-2 rounded-2xl text-slate-900 dark:text-slate-100 text-sm font-medium focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all ${
          error ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-100 dark:border-slate-700'
        }`}
      />

      {/* Calendar Icon on Left */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="absolute left-3.5 top-3.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
        title="Öppna kalender"
      >
        <CalendarIcon className="w-5 h-5" />
      </button>

      {/* Calendar Trigger Button on Right */}
      <div className="absolute right-2 top-2 bottom-2 flex items-center">
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Välj datum</span>
        </button>
      </div>

      {/* Custom Swedish React Calendar Popover */}
      {showCalendar && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          {/* Calendar Header */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
              >
                {yearsRange.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Må', 'Ti', 'On', 'To', 'Fr', 'Lö', 'Sö'].map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset cells for first week */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {/* Days of Month */}
            {Array.from({ length: monthDays }).map((_, i) => {
              const dayNum = i + 1;
              const formattedSelected = `${dayNum < 10 ? '0' + dayNum : dayNum}/${viewMonth + 1 < 10 ? '0' + (viewMonth + 1) : viewMonth + 1}/${String(viewYear).slice(2)}`;
              const isSelected = value === formattedSelected;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 w-8 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                handleSelectDay(today.getDate());
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Idag
            </button>
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium cursor-pointer"
            >
              Stäng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
