import React, { useState } from 'react';
import { X, Copy, Check, Code, Globe, Shield, FileSpreadsheet, Folder } from 'lucide-react';

interface WordPressEmbedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const WordPressEmbedGuideModal: React.FC<WordPressEmbedGuideModalProps> = ({ isOpen, onClose, appUrl }) => {
  const [activeTab, setActiveTab] = useState<'iframe' | 'shortcode' | 'subdomain' | 'googleApi'>('iframe');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAppUrl = appUrl ? (appUrl.endsWith('/') ? appUrl : `${appUrl}/`) : `${window.location.origin}/`;

  const iframeSnippet = `<!-- Anixi Au Pair Application Form - Pure HTML WPBakery / WordPress Embed (ModSecurity & Firewall Safe) -->
<div id="anixi-form-container" style="width: 100%; max-width: 900px; margin: 0 auto; min-height: 850px; position: relative;">
  <iframe
    id="anixi-app-iframe"
    src="${currentAppUrl}"
    style="width: 100%; height: 950px; border: none; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); display: block;"
    allow="geolocation; camera; microphone"
    loading="lazy"
    title="Anixi Au Pair Application Form"
  ></iframe>
</div>`;

  const shortcodeSnippet = `<?php
/**
 * Plugin Name: Anixi Au Pair Form Embed
 * Description: Shortcode [anixi_application_form] to embed the Australia Au Pair Application form seamlessly.
 * Version: 1.0.0
 * Author: Anixi Agency
 */

if (!defined('ABSPATH')) exit;

function anixi_render_au_pair_form($atts) {
    $atts = shortcode_atts(array(
        'height' => '850px',
        'width' => '100%',
    ), $atts, 'anixi_application_form');

    $app_url = '${currentAppUrl}';

    ob_start();
    ?>
    <div className="anixi-form-wrapper" style="width: 100%; max-width: 960px; margin: 2rem auto;">
        <iframe
            src="<?php echo esc_url($app_url); ?>"
            style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>; border: none; border-radius: 16px;"
            allow="camera; microphone"
            loading="lazy">
        </iframe>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('anixi_application_form', 'anixi_render_au_pair_form');
`;

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-3xl w-full p-6 my-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-[#436ebe] dark:text-blue-300 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                WordPress & API Integration Setup Guide
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Deploy Anixi Au Pair application form on WordPress & configure Google APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 my-4 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('iframe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'iframe'
                ? 'bg-[#436ebe] text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Option 1: iFrame Embed
          </button>
          <button
            onClick={() => setActiveTab('shortcode')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shortcode'
                ? 'bg-[#436ebe] text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Option 2: WP Shortcode
          </button>
          <button
            onClick={() => setActiveTab('subdomain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'subdomain'
                ? 'bg-[#436ebe] text-white shadow-2xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            Option 3: Subdomain CNAME
          </button>
          <button
            onClick={() => setActiveTab('googleApi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'googleApi'
                ? 'bg-[#436ebe] text-white shadow-2xs'
                : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
            }`}
          >
            🔑 Google APIs & Credentials
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {/* TAB 1: iFrame */}
          {activeTab === 'iframe' && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Embed via iFrame / Custom HTML Block in WordPress
              </h3>
              <p className="text-stone-600 dark:text-stone-300">
                1. Open your WordPress page editor (Gutenberg, Elementor, Divi, or Classic Editor).
                <br />
                2. Add a <strong>Custom HTML block</strong> to your target page (e.g. <code>anixi.com/ansokan/</code>).
                <br />
                3. Copy and paste the code snippet below into the block:
              </p>

              <div className="relative bg-stone-900 text-stone-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto border border-stone-800">
                <button
                  onClick={() => handleCopy(iframeSnippet, 'iframe')}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-sans flex items-center gap-1 transition-colors"
                >
                  {copiedCode === 'iframe' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <pre>{iframeSnippet}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: WP Shortcode */}
          {activeTab === 'shortcode' && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                WordPress Plugin or Shortcode Integration
              </h3>
              <p className="text-stone-600 dark:text-stone-300">
                You can create a lightweight WordPress snippet using code snippet plugins (e.g., Code Snippets) or in your child theme's <code>functions.php</code>.
              </p>

              <div className="relative bg-stone-900 text-stone-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto border border-stone-800">
                <button
                  onClick={() => handleCopy(shortcodeSnippet, 'shortcode')}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-sans flex items-center gap-1 transition-colors"
                >
                  {copiedCode === 'shortcode' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy PHP Code</span>
                    </>
                  )}
                </button>
                <pre>{shortcodeSnippet}</pre>
              </div>

              <p className="text-stone-600 dark:text-stone-300">
                After saving the PHP code, simply insert <code>[anixi_application_form]</code> anywhere on your WordPress site!
              </p>
            </div>
          )}

          {/* TAB 3: Subdomain */}
          {activeTab === 'subdomain' && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Standalone Subdomain Deployment (e.g. apply.anixi.com)
              </h3>
              <p className="text-stone-600 dark:text-stone-300">
                For a seamless branded experience without iframe wrappers, point a custom subdomain directly to this Cloud Run app:
              </p>
              <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-2xl space-y-2 border border-stone-200 dark:border-stone-700">
                <div className="font-semibold text-stone-900 dark:text-stone-100">DNS Configuration Steps:</div>
                <ul className="list-disc pl-5 space-y-1 text-stone-600 dark:text-stone-300">
                  <li>Log into your DNS provider (Cloudflare, GoDaddy, Loopia, etc.).</li>
                  <li>Add a CNAME record: <code>apply</code> pointing to <code>{currentAppUrl.replace('https://', '')}</code></li>
                  <li>Enable SSL / HTTPS certificate.</li>
                  <li>Set up CORS origin allowance in server environment variables.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Google APIs */}
          {activeTab === 'googleApi' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-50 dark:bg-amber-950/60 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Google Drive & Google Sheets Integration Settings (Australia Test)
                </h3>
                <p className="text-stone-700 dark:text-stone-300">
                  When applicants submit the form, the backend generates an application PDF and uploads it to Google Drive while appending key details to Google Sheets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-stone-50 dark:bg-stone-800 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 mb-1">
                    <Folder className="w-4 h-4 text-teal-600" />
                    Target Drive Folder ID
                  </div>
                  <code className="text-[11px] font-mono block bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-300 dark:border-stone-700 select-all">
                    1nPABaxIt3DkRnuphSvpXOhM0WZ3XIrr1
                  </code>
                </div>

                <div className="bg-stone-50 dark:bg-stone-800 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Target Spreadsheet ID
                  </div>
                  <code className="text-[11px] font-mono block bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-300 dark:border-stone-700 select-all">
                    17qrXdjrJ0iYcwf8XKijIVEXLrdqNYCNCZWmK35LCOvI
                  </code>
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100">Step-by-Step Google Credentials Setup:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-stone-600 dark:text-stone-300">
                  <li>Go to Google Cloud Console (console.cloud.google.com).</li>
                  <li>Enable <strong>Google Drive API</strong> and <strong>Google Sheets API</strong>.</li>
                  <li>Create a <strong>Service Account</strong> (e.g. <code>anixi-bot@...iam.gserviceaccount.com</code>).</li>
                  <li>Generate a JSON Key and copy the <code>client_email</code> and <code>private_key</code>.</li>
                  <li>
                    <strong>Crucial Step:</strong> Share the Google Drive folder{' '}
                    <code>1nPABaxIt3DkRnuphSvpXOhM0WZ3XIrr1</code> and Google Sheet{' '}
                    <code>17qrXdjrJ0iYcwf8XKijIVEXLrdqNYCNCZWmK35LCOvI</code> with your Service Account email address as <strong>Editor</strong>.
                  </li>
                  <li>Add <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code> and <code>GOOGLE_PRIVATE_KEY</code> to environment variables or Secrets panel.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
