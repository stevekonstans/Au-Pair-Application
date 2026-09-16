import React, { useEffect, useState } from 'react';
import { safeFetchJson, getStoredSmtpConfig, saveStoredSmtpConfig, sendDirectEmail, SmtpConfig } from '../utils/api';
import { X, Database, RefreshCw, CheckCircle2, AlertTriangle, FileText, ExternalLink, Mail, Send, Save, Key, Settings2 } from 'lucide-react';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<any>(null);
  const [submissionsData, setSubmissionsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('info@anixi.se');
  const [emailTestResult, setEmailTestResult] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [smtpForm, setSmtpForm] = useState<SmtpConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    user: 'info@anixi.se',
    pass: '',
    fromName: 'Anixi Au Pair',
    fromEmail: 'info@anixi.se',
    secure: false,
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const configJson = await safeFetchJson('/api/config');
      setConfig(configJson);

      const subJson = await safeFetchJson('/api/admin/submissions');
      setSubmissionsData(subJson);

      // Load saved SMTP settings from localStorage or backend API
      const stored = getStoredSmtpConfig();
      if (stored && stored.host) {
        setSmtpForm((prev) => ({ ...prev, ...stored }));
      } else {
        const backendSmtp = await safeFetchJson('/api/admin/smtp-config').catch(() => null);
        if (backendSmtp && backendSmtp.host) {
          setSmtpForm((prev) => ({
            ...prev,
            host: backendSmtp.host || prev.host,
            port: backendSmtp.port || prev.port,
            user: backendSmtp.user || prev.user,
            fromName: backendSmtp.fromName || prev.fromName,
            fromEmail: backendSmtp.fromEmail || prev.fromEmail,
            secure: backendSmtp.secure !== undefined ? backendSmtp.secure : prev.secure,
          }));
        }
      }
    } catch (e) {
      console.error('Error fetching admin status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Sparar inställningar...');
    const ok = await saveStoredSmtpConfig(smtpForm);
    if (ok) {
      setSaveStatus('SMTP-inställningar sparades framgångsrikt (lokalt & backend)!');
      fetchAdminData();
    } else {
      setSaveStatus('Kunde inte spara SMTP-inställningar.');
    }
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      alert('Vänligen ange en giltig e-postadress för testutskick.');
      return;
    }

    setTestingEmail(true);
    setEmailTestResult(null);
    try {
      const res = await sendDirectEmail({
        to: testEmailRecipient,
        subject: 'Testutskick från Anixi Au Pair SMTP-tjänst',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #007bff; margin-top: 0;">SMTP Testutskick Framgångsrikt! 🎉</h2>
            <p>Detta är ett verifieringstest skickat från din Anixi Au Pair e-postkonfiguration.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
            <p style="font-size: 12px; color: #666;">
              <strong>Använt SMTP-värd:</strong> ${smtpForm.host}:${smtpForm.port}<br>
              <strong>Avsändare:</strong> ${smtpForm.fromName} &lt;${smtpForm.fromEmail}&gt;<br>
              <strong>Tidpunkt:</strong> ${new Date().toLocaleString('sv-SE')}
            </p>
          </div>
        `,
        smtpConfig: smtpForm
      });
      setEmailTestResult(res);
      fetchAdminData();
    } catch (e: any) {
      setEmailTestResult({ success: false, error: e.message || 'Kunde inte skicka test-mejl.' });
    } finally {
      setTestingEmail(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-3xl w-full p-6 my-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#436ebe]/10 dark:bg-blue-950/80 text-[#436ebe] dark:text-blue-300 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Anixi Backend & SMTP Konfigurationspanel
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Full-stack SMTP serverless & Express e-posttjänst för både AI Studio & Netlify
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Uppdatera"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 space-y-5 my-4 pr-1 text-xs">
          
          {/* SMTP Configuration Form */}
          <div className="bg-stone-50 dark:bg-stone-800/80 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#436ebe] dark:text-blue-400" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  SMTP Server & Inloggningsuppgifter
                </h3>
              </div>
              {smtpForm.host && smtpForm.user && (smtpForm.pass || config?.isSmtpConfigured) ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SMTP Redo för utskick</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#436ebe]" />
                  <span>SMTP Ej Konfigurerad</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSmtp} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    SMTP Host / Server
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="t.ex. smtp.gmail.com eller mail.anixi.se"
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs focus:ring-2 focus:ring-[#436ebe] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="587"
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value, 10) || 587 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs focus:ring-2 focus:ring-[#436ebe] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    SMTP Användarnamn / E-post
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="t.ex. info@anixi.se"
                    value={smtpForm.user}
                    onChange={(e) => {
                      const newUser = e.target.value;
                      setSmtpForm((prev) => ({
                        ...prev,
                        user: newUser,
                        fromEmail: (prev.fromEmail === prev.user || prev.fromEmail === 'info@anixi.se' || !prev.fromEmail) ? newUser : prev.fromEmail
                      }));
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs focus:ring-2 focus:ring-[#436ebe] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-stone-400" />
                    <span>SMTP Lösenord / App-lösenord</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Lösenord för SMTP"
                    value={smtpForm.pass}
                    onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs focus:ring-2 focus:ring-[#436ebe] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    Avsändarnamn (Display Name)
                  </label>
                  <input
                    type="text"
                    placeholder="Anixi Au Pair"
                    value={smtpForm.fromName}
                    onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-[#436ebe] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-medium mb-1">
                    Avsändar-epost (From Email)
                  </label>
                  <input
                    type="email"
                    placeholder="noreply@anixi.se"
                    value={smtpForm.fromEmail}
                    onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-[#436ebe] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={smtpForm.secure}
                    onChange={(e) => setSmtpForm({ ...smtpForm, secure: e.target.checked })}
                    className="rounded text-[#436ebe] focus:ring-[#436ebe] w-4 h-4"
                  />
                  <span>Använd SSL/TLS (Används oftast vid port 465)</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#436ebe] hover:bg-[#375ca3] text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Spara SMTP-inställningar</span>
                </button>
              </div>

              {saveStatus && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-300 text-blue-900 dark:text-blue-100 font-medium text-xs">
                  {saveStatus}
                </div>
              )}
            </form>
          </div>

          {/* Test Email Section */}
          <div className="bg-blue-50/80 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Testa SMTP e-postutskick live (`/api/send-email`)
                </h3>
              </div>
            </div>

            <p className="text-stone-600 dark:text-stone-400 text-[11px]">
              Skicka ett verifieringstest för att kontrollera att din e-posttjänst kan ansluta och leverera meddelanden. Fungerar både i AI Studio dev-miljö och på Netlify production!
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="info@anixi.se"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />

              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <Send className={`w-3.5 h-3.5 ${testingEmail ? 'animate-bounce' : ''}`} />
                <span>{testingEmail ? 'Skickar testmejl...' : 'Skicka test-mejl'}</span>
              </button>
            </div>

            {emailTestResult && (
              <div className={`p-3 rounded-xl border font-mono text-[11px] ${
                emailTestResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-900 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950 border-rose-300 text-rose-900 dark:text-rose-100'
              }`}>
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {emailTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{emailTestResult.success ? 'E-post skickades framgångsrikt!' : 'Kunde inte skicka e-post'}</span>
                </div>
                <pre className="whitespace-pre-wrap overflow-x-auto text-[10px] mt-1 p-2 bg-black/5 dark:bg-black/30 rounded-lg">{JSON.stringify(emailTestResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Submissions Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                Inkomna Ansökningar & E-poststatus ({submissionsData?.total || 0})
              </h3>
            </div>

            {submissionsData?.submissions?.length === 0 ? (
              <div className="text-center py-6 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                Inga ansökningar registrerade ännu. Fyll i och skicka in formuläret för att testa!
              </div>
            ) : (
              <div className="space-y-2.5">
                {submissionsData?.submissions?.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                      <span>
                        {sub.fullName} ({sub.email})
                      </span>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full font-mono">
                        {sub.id}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 dark:text-stone-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <strong>Land:</strong> {sub.country} | <strong>Tid:</strong>{' '}
                        {new Date(sub.submittedAt).toLocaleTimeString('sv-SE')}
                      </div>
                      <div>
                        <strong>Admin E-post:</strong> {sub.adminEmailNotification?.status || 'N/A'} | <strong>Sökande E-post:</strong>{' '}
                        {sub.applicantEmailNotification?.status || 'N/A'}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center space-x-2">
                      <a
                        href={`/api/applications/pdf/${sub.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#436ebe] dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors text-[11px]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Visa PDF Ansökan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
