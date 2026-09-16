import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { JobApplicationForm } from './components/JobApplicationForm';
import { WordPressEmbedGuideModal } from './components/WordPressEmbedGuideModal';
import { AdminConsoleModal } from './components/AdminConsoleModal';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isEmbedGuideOpen, setIsEmbedGuideOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);

  // Check if admin mode is requested via URL query (?admin=true or ?admin=1)
  const isAdmin = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('admin') === 'true' ||
    new URLSearchParams(window.location.search).get('admin') === '1'
  );

  // Sync dark mode class with root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Send auto-height postMessage to parent window for WordPress/WPBakery container resizing
  useEffect(() => {
    const sendHeight = () => {
      if (window.parent && window.parent !== window) {
        const height = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({ type: 'ANIXI_RESIZE_IFRAME', height }, '*');
      }
    };

    sendHeight();
    const observer = new ResizeObserver(() => sendHeight());
    observer.observe(document.body);
    window.addEventListener('resize', sendHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sendHeight);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* Header Navigation */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showAdminTools={isAdmin}
          onOpenEmbedGuide={() => setIsEmbedGuideOpen(true)}
          onOpenAdminConsole={() => setIsAdminConsoleOpen(true)}
        />

        {/* Main Job Application Form Content */}
        <main className="pb-12">
          <JobApplicationForm />
        </main>
      </div>

      {/* WordPress Embed Helper Modal */}
      <WordPressEmbedGuideModal
        isOpen={isEmbedGuideOpen}
        onClose={() => setIsEmbedGuideOpen(false)}
        appUrl={window.location.origin}
      />

      {/* Admin Console Modal */}
      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <p>© {new Date().getFullYear()} Anixi. Alla rättigheter förbehållna. Au Pair Program.</p>
      </footer>
    </div>
  );
}
