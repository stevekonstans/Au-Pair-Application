import { appendToExcel } from '../utils/msGraph.js';
import { sendEmail } from '../utils/email.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return onRequestOptions();
  }
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return new Response(JSON.stringify({ error: `Method ${context.request.method} not allowed` }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    // Basic validation
    if (!data.fullName || !data.email || !data.phone) {
      return new Response(
        JSON.stringify({ success: false, message: 'Namn, e-post och telefonnummer är obligatoriska fält.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const applicationId = data.applicationId || `ANX-${Date.now().toString(36).toUpperCase()}`;

    // 1. Save to Microsoft OneDrive (Excel) via Microsoft Graph API
    let msGraphSuccess = false;
    let msGraphError = null;
    let msGraphFilePath = null;
    try {
      if (env.MS_TENANT_ID && env.MS_CLIENT_ID && env.MS_CLIENT_SECRET) {
        const res = await appendToExcel({ ...data, applicationId }, env);
        msGraphSuccess = true;
        msGraphFilePath = res?.filePath || 'ANIXI/APPLICANTS/USA/AuPairApplication.xlsx';
      } else {
        msGraphError = 'Microsoft Graph-variabler saknas i Cloudflare Settings.';
      }
    } catch (e) {
      console.error('Failed to append to MS Graph Excel:', e);
      msGraphError = e.message || String(e);
    }

    // 2. Send Notification and Confirmation Emails
    let adminEmailSuccess = false;
    let adminEmailError = null;
    let applicantEmailSuccess = false;
    let applicantEmailError = null;

    // Admin Notification in English
    try {
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

      await sendEmail({
        to: env.ADMIN_EMAIL || 'info@anixi.se',
        subject: `New Application (${data.applyingCountry || 'Au Pair'}): ${data.fullName}`,
        html: adminHtml,
        fromName: env.SMTP_FROM_NAME || 'Team Anixi',
        fromEmail: env.SMTP_FROM_EMAIL || 'info@anixi.se',
        env,
      });
      adminEmailSuccess = true;
    } catch (err) {
      console.error('Admin email failed:', err);
      adminEmailError = err.message || String(err);
    }

    // Applicant Confirmation with requested HTML
    try {
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

      await sendEmail({
        to: data.email,
        subject: `Tack för din ansökan till Anixi Au Pair, ${data.fullName}!`,
        html: applicantHtml,
        fromName: env.SMTP_FROM_NAME || 'Team Anixi',
        fromEmail: env.SMTP_FROM_EMAIL || 'info@anixi.se',
        env,
      });
      applicantEmailSuccess = true;
    } catch (err) {
      console.error('Applicant email failed:', err);
      applicantEmailError = err.message || String(err);
    }

    const emailStatus = (adminEmailSuccess && applicantEmailSuccess) ? 'Success' : ((adminEmailSuccess || applicantEmailSuccess) ? 'Partial' : 'Failed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tack! Din ansökan har skickats framgångsrikt.',
        msGraphStatus: msGraphSuccess ? 'Success' : 'Failed',
        msGraphError,
        emailStatus,
        adminEmail: adminEmailSuccess ? 'Sent' : adminEmailError,
        applicantEmail: applicantEmailSuccess ? 'Sent' : applicantEmailError,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err) {
    console.error('Error handling submission in Cloudflare Function:', err);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Ett fel uppstod när ansökan skulle bearbetas. Vänligen försök igen.',
        error: err.message || String(err),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}
