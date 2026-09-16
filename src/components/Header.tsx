import React from 'react';
import { Code, Database, Sun, Moon } from 'lucide-react';
import { AnixiLogo } from './AnixiLogo';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  showAdminTools?: boolean;
  onOpenEmbedGuide?: () => void;
  onOpenAdminConsole?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  showAdminTools = false,
  onOpenEmbedGuide,
  onOpenAdminConsole,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 px-4 sm:px-8 py-4 flex justify-between items-center shadow-xs sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-xs shrink-0">
            <AnixiLogo size={46} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                ANIXI
              </h1>
            </div>
            <p className="text-xs font-bold text-[#436ebe] uppercase tracking-widest">
              Au Pair Application Form
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Admin tools are strictly hidden from users unless accessed via ?admin=true */}
          {showAdminTools && onOpenEmbedGuide && (
            <button
              onClick={onOpenEmbedGuide}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="WordPress Integration & Google API Setup"
            >
              <Code className="w-3.5 h-3.5 text-[#436ebe]" />
              <span className="hidden sm:inline">WP Embed Guide</span>
            </button>
          )}

          {showAdminTools && onOpenAdminConsole && (
            <button
              onClick={onOpenAdminConsole}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="View backend status and application logs"
            >
              <Database className="w-3.5 h-3.5 text-[#436ebe]" />
              <span className="hidden sm:inline">Admin Console</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            type="button"
            className="p-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#436ebe]" />
            ) : (
              <Moon className="w-4 h-4 text-[#436ebe]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

