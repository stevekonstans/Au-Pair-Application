import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { appendToExcel } from './functions/utils/msGraph.js';
import { sendEmail } from './functions/utils/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

interface StoredSubmission {
  id: string;
  createdAt: string;
  data: any;
  status: string;
  msGraphStatus?: string;
  emailStatus?: string;
  adminEmailStatus?: string;
  applicantEmailStatus?: string;
}

const submissions: StoredSubmission[] = [];
const drafts: Record<string, any> = {};
let runtimeSmtpConfig: any = null;

// Universal email sender helper
async function sendAppEmail({
  to,
  subject,
  html,
  text,
  fromName,
  fromEmail,
  smtpOverride,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
  smtpOverride?: any;
}) {
  const host = smtpOverride?.host || runtimeSmtpConfig?.host || process.env.SMTP_HOST || 'mailcluster.loopia.se';
  const port = parseInt(smtpOverride?.port || runtimeSmtpConfig?.port || process.env.SMTP_PORT || '465', 10);
  const user = smtpOverride?.user || runtimeSmtpConfig?.user || process.env.SMTP_USER || 'info@anixi.se';
  const pass = smtpOverride?.pass || runtimeSmtpConfig?.pass || process.env.SMTP_PASS;
  const secure = (smtpOverride?.secure !== undefined)
    ? smtpOverride.secure
    : (runtimeSmtpConfig?.secure !== undefined)
    ? runtimeSmtpConfig.secure
    : (process.env.SMTP_SECURE === 'true' || port === 465);
  const fromN = fromName || smtpOverride?.fromName || runtimeSmtpConfig?.fromName || process.env.SMTP_FROM_NAME || 'Team Anixi';
  const fromE = fromEmail || smtpOverride?.fromEmail || runtimeSmtpConfig?.fromEmail || process.env.SMTP_FROM_EMAIL || 'info@anixi.se';

  // 1. Prioritize Loopia / SMTP when pass is available
  if (pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
      const info = await transporter.sendMail({
        from: `"${fromN}" <${fromE}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        html,
      });
      console.log(`[SMTP Delivery Success] To: ${to}, MessageId: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (smtpErr: any) {
      console.warn(`[SMTP Delivery Failed] To: ${to}, Error:`, smtpErr.message);
    }
  }

  // 2. Fallback to functions/utils/email.js (Resend / MS Graph / Webhook)
  return await sendEmail({
    to,
    subject,
    html,
    fromName: fromN,
    fromEmail: fromE,
    env: process.env,
  });
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Configuration status for admin
  app.get('/api/config', (req, res) => {
    res.json({
      msGraphConfigured: !!(process.env.MS_TENANT_ID && process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET),
      emailConfigured: !!(process.env.SMTP_PASS || process.env.RESEND_API_KEY || runtimeSmtpConfig?.pass),
      adminEmail: process.env.ADMIN_EMAIL || 'info@anixi.se',
      oneDriveConfigured: !!(process.env.MS_TENANT_ID && process.env.MS_CLIENT_ID),
    });
  });

  // 3. Admin submissions list
  app.get('/api/admin/submissions', (req, res) => {
    res.json({
      submissions: submissions.map(s => ({
        id: s.id,
        fullName: s.data.fullName || 'N/A',
        email: s.data.email || 'N/A',
        phone: s.data.phone || 'N/A',
        applyingCountry: s.data.applyingCountry || 'Australia',
        createdAt: s.createdAt,
        status: s.status,
        emailStatus: s.emailStatus,
        adminEmailStatus: s.adminEmailStatus,
        applicantEmailStatus: s.applicantEmailStatus,
      })),
      total: submissions.length,
    });
  });

  // 4. Admin SMTP config get & post
  app.get('/api/admin/smtp-config', (req, res) => {
    res.json(runtimeSmtpConfig || {
      host: process.env.SMTP_HOST || 'mailcluster.loopia.se',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      user: process.env.SMTP_USER || 'info@anixi.se',
      fromName: process.env.SMTP_FROM_NAME || 'Team Anixi',
      fromEmail: process.env.SMTP_FROM_EMAIL || 'info@anixi.se',
      secure: process.env.SMTP_SECURE === 'true',
    });
  });

  app.post('/api/admin/smtp-config', (req, res) => {
    runtimeSmtpConfig = req.body;
    res.json({ success: true, message: 'SMTP configuration updated' });
  });

  // 5. Send direct test email
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html, message, fromName, fromEmail, smtpConfig } = req.body;
      const content = html || `<p>${message || 'Test email from Anixi system'}</p>`;
      const result = await sendAppEmail({
        to: to || process.env.ADMIN_EMAIL || 'info@anixi.se',
        subject: subject || 'Test Email from Anixi Form',
        html: content,
        fromName: fromName || process.env.SMTP_FROM_NAME || 'Team Anixi',
        fromEmail: fromEmail || process.env.SMTP_FROM_EMAIL || 'info@anixi.se',
        smtpOverride: smtpConfig,
      });
      res.json({ success: true, result });
    } catch (err: any) {
      console.warn('Direct send email error:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Save application draft
  app.post('/api/applications/save', (req, res) => {
    const draftId = `DRAFT-${Date.now().toString(36).toUpperCase()}`;
    drafts[draftId] = {
      id: draftId,
      data: req.body,
      savedAt: new Date().toISOString(),
    };
    res.json({
      success: true,
      draftId,
      message: 'Utkast sparat!',
      resumeUrl: `?draft=${draftId}`,
    });
  });

  // 7. Get application draft
  app.get('/api/applications/draft/:id', (req, res) => {
    const draft = drafts[req.params.id];
    if (!draft) {
      return res.status(404).json({ error: 'Utkast hittades inte' });
    }
    res.json({ success: true, draft });
  });

  // 8. Main application submission handler (/api/submit and /api/apply)
  const handleSubmission = async (req: express.Request, res: express.Response) => {
    try {
      const data = req.body || {};

      // Basic validation
      if (!data.fullName || !data.email || !data.phone) {
        return res.status(400).json({
          success: false,
          message: 'Namn, e-post och telefonnummer är obligatoriska fält.',
        });
      }

      const applicationId = `ANX-${Date.now().toString(36).toUpperCase()}`;

      // 1. Save to Microsoft OneDrive (Excel) if env credentials exist
      let msGraphSuccess = false;
      let msGraphError: string | null = null;
      let msGraphFilePath: string | null = null;
      try {
        if (process.env.MS_TENANT_ID && process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET) {
          const res = await appendToExcel({ ...data, applicationId }, process.env);
          msGraphSuccess = true;
          msGraphFilePath = (res as any)?.filePath || 'ANIXI/APPLICANTS/USA/AuPairApplication.xlsx';
        } else {
          msGraphError = 'Microsoft Graph-variabler inte konfigurerade i miljövariabler.';
        }
      } catch (e: any) {
        console.warn('MS Graph Excel notice:', e.message || String(e));
        msGraphError = e.message || String(e);
      }

      // 2. Send Notification to Admin (info@anixi.se) and Confirmation to Applicant (data.email)
      let adminEmailSuccess = false;
      let adminEmailError: string | null = null;
      let applicantEmailSuccess = false;
      let applicantEmailError: string | null = null;

      // Build Admin Email HTML Table in ENGLISH
      const adminHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #436ebe; padding: 24px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">New Application: Au Pair ${data.applyingCountry || 'Program'}</h2>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 13px;">Reference ID: <strong>${applicationId}</strong> | ${new Date().toUTCString()}</p>
          </div>

          <div style="padding: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #436ebe; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">1. Applicant Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; width: 38%; color: #64748b;">Full Name:</td><td style="font-weight: bold;">${data.fullName}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Date of Birth:</td><td>${data.dateOfBirth || data.birthDate || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Email Address:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Phone Number:</td><td>${data.phone}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Country of Residence:</td><td>${data.country || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Nationality:</td><td>${data.nationality || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Gender:</td><td>${data.gender || '-'}</td></tr>
            </table>

            <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #436ebe; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">2. Availability & Destination</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; width: 38%; color: #64748b;">Destination Country:</td><td style="font-weight: bold; color: #436ebe;">${data.applyingCountry || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Desired Stay Duration:</td><td>${data.stayDuration || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Earliest Travel Date:</td><td>${data.earliestTravelDate || data.earliestDeparture || '-'}</td></tr>
            </table>

            <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #436ebe; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">3. Experience & Skills</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; width: 38%; color: #64748b;">Childcare Age Experience:</td><td>${(data.childcareAgeExperience || []).join(', ') || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Number of Children Looked After:</td><td>${(data.numberOfChildren || []).join(', ') || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Driver's License:</td><td>${data.driversLicense || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Swimming Skills:</td><td>${data.swimmingSkills || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Native Language:</td><td>${data.nativeLanguage || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Language Proficiency:</td><td>English: ${data.languageEnglish || '-'} | French: ${data.languageFrench || '-'} | German: ${data.languageGerman || '-'} | Spanish: ${data.languageSpanish || '-'}</td></tr>
            </table>

            <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #436ebe; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">4. Lifestyle & Preferences</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; width: 38%; color: #64748b;">Open to Single Parent Family:</td><td>${data.singleParentFamily || '-'}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Family with Pets:</td><td>${data.familyWithPets || '-'} ${data.petsNotAccepted ? `(Does not accept: ${data.petsNotAccepted})` : ''}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Smoking Habits:</td><td>${data.smoke || '-'} ${data.cigarettesPerDay ? `(${data.cigarettesPerDay} cig/day)` : ''}</td></tr>
            </table>

            <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #436ebe; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">5. General (Health & Background)</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; width: 38%; color: #64748b;">Legal / Criminal Record:</td><td>${data.legalBackground || '-'} ${data.legalBackgroundDetails ? `<br/><span style="color: #64748b; font-size: 12px;">Details: ${data.legalBackgroundDetails}</span>` : ''}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Chronic Health Conditions:</td><td>${data.chronicHealth || '-'} ${data.chronicHealthDetails ? `<br/><span style="color: #64748b; font-size: 12px;">Details: ${data.chronicHealthDetails}</span>` : ''}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Counseling / Mental Support:</td><td>${data.counsellingSupport || '-'} ${data.counsellingSupportDetails ? `<br/><span style="color: #64748b; font-size: 12px;">Details: ${data.counsellingSupportDetails}</span>` : ''}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Eating Disorder / Health Issue:</td><td>${data.eatingHealthIssue || '-'} ${data.eatingHealthIssueDetails ? `<br/><span style="color: #64748b; font-size: 12px;">Details: ${data.eatingHealthIssueDetails}</span>` : ''}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Regular Medication:</td><td>${data.takingMedication || '-'} ${data.takingMedicationDetails ? `<br/><span style="color: #64748b; font-size: 12px;">Details: ${data.takingMedicationDetails}</span>` : ''}</td></tr>
            </table>

            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <strong>OneDrive Status:</strong> ${msGraphSuccess ? '✅ Saved in Excel (' + (msGraphFilePath || 'ANIXI/APPLICANTS/USA/AuPairApplication.xlsx') + ')' : 'ℹ️ ' + (msGraphError || 'Not saved')}
            </div>
          </div>
        </div>
      `;

      // Build Applicant Confirmation Email HTML
      const applicantHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px; line-height: 1.6;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background: #436ebe; padding: 28px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Anixi Au Pair</h1>
            </div>
            <div style="padding: 32px 24px;">
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 12px; text-transform: uppercase; color: #1e40af; font-weight: 700; letter-spacing: 0.05em;">Ditt Referensnummer</div>
                <div style="font-size: 20px; font-weight: 800; color: #1d4ed8; margin-top: 4px;">${applicationId}</div>
              </div>

              <strong>Nu börjar ditt äventyr på riktigt!</strong> ✨ 

              <p>Hej! 

              Nu händer det! Din resa mot nya vänner, roadtrips och minnen för livet har officiellt börjat. Vi är så taggade på att få vara en del av ditt nästa stora kapitel som au pair. 

              </p> <p>Snart landar ett mejl i din inkorg med länken till <strong>Anixi Hub</strong> – din personliga portal och "home base" för hela ansökan. Det är här du bygger din profil och kommer ett steg närmare din framtida värdfamilj.</p> 


              <p><strong>Frågor? Vi löser det. 🤝</strong> 
              Om du vill ha lite personlig hjälp eller bara vill snacka ihop dig om resan, så kör vi gärna en snabb check-in på 10 minuter. Det är helt valfritt, bara om du känner för det. 🔗</p> 

              <p>👉 <a href="https://tinyurl.com/4y8ccytr" style="background: #007bff; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">Boka ditt 10-minuterssamtal här</a></p> 

              <p>Vi finns här för alla frågor, stora som små. Nu kör vi – din drömresa väntar! 🫶 

              Varma hälsningar, <br/>
              <strong>Anixi Au Pair-teamet</strong></p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; background: #f8fafc;">
              © ${new Date().getFullYear()} Anixi. Alla rättigheter förbehållna. | <a href="https://anixi.se" style="color: #436ebe; text-decoration: none;">anixi.se</a>
            </div>
          </div>
        </div>
      `;

      // 1. Send Admin Email
      try {
        await sendAppEmail({
          to: process.env.ADMIN_EMAIL || 'info@anixi.se',
          subject: `New Application (${data.applyingCountry || 'Au Pair'}): ${data.fullName}`,
          html: adminHtml,
          fromName: process.env.SMTP_FROM_NAME || 'Team Anixi',
          fromEmail: process.env.SMTP_FROM_EMAIL || 'info@anixi.se',
        });
        adminEmailSuccess = true;
      } catch (err: any) {
        console.error('Admin email failed:', err.message);
        adminEmailError = err.message || String(err);
      }

      // 2. Send Applicant Confirmation Email
      try {
        await sendAppEmail({
          to: data.email,
          subject: `Tack för din ansökan till Anixi Au Pair, ${data.fullName}!`,
          html: applicantHtml,
          fromName: process.env.SMTP_FROM_NAME || 'Team Anixi',
          fromEmail: process.env.SMTP_FROM_EMAIL || 'info@anixi.se',
        });
        applicantEmailSuccess = true;
      } catch (err: any) {
        console.error('Applicant email failed:', err.message);
        applicantEmailError = err.message || String(err);
      }

      const emailStatus = (adminEmailSuccess && applicantEmailSuccess)
        ? 'Success'
        : (adminEmailSuccess || applicantEmailSuccess)
        ? 'Partial'
        : 'Failed';

      // Record in local store
      submissions.unshift({
        id: applicationId,
        createdAt: new Date().toISOString(),
        data,
        status: 'Mottagen',
        msGraphStatus: msGraphSuccess ? 'Success' : 'Failed',
        emailStatus,
        adminEmailStatus: adminEmailSuccess ? 'Sent' : adminEmailError,
        applicantEmailStatus: applicantEmailSuccess ? 'Sent' : applicantEmailError,
      });

      return res.status(200).json({
        success: true,
        applicationId,
        message: 'Tack! Din ansökan har skickats framgångsrikt.',
        msGraphStatus: msGraphSuccess ? 'Success' : 'Failed',
        msGraphError,
        emailStatus,
        adminEmail: adminEmailSuccess ? 'Sent' : adminEmailError,
        applicantEmail: applicantEmailSuccess ? 'Sent' : applicantEmailError,
      });
    } catch (err: any) {
      console.error('Submission error handler:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Ett fel uppstod när ansökan skulle bearbetas.',
        error: err.message || String(err),
      });
    }
  };

  app.post('/api/submit', handleSubmission);
  app.post('/api/apply', handleSubmission);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
