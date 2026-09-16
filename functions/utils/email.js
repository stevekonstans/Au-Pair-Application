// functions/utils/email.js
// Universal Email Sender for Cloudflare Pages (supports Resend and MS Graph API)
// Zero external binary dependencies - works 100% natively in Cloudflare Pages edge runtime

/**
 * Send email via Resend API
 */
async function sendViaResend({ to, subject, html, fromName, fromEmail, env }) {
  const from = env.RESEND_FROM_EMAIL || (env.RESEND_DOMAIN ? `${fromName || 'Team Anixi'} <info@${env.RESEND_DOMAIN}>` : `${fromName || 'Team Anixi'} <onboarding@resend.dev>`);
  
  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const resData = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = resData?.message || JSON.stringify(resData) || `HTTP ${res.status}`;
    throw new Error(`Resend error (${res.status}): ${errorMsg}`);
  }

  return { provider: 'resend', ...resData };
}

/**
 * Send email via Microsoft Graph API (using existing MS Tenant credentials)
 */
async function sendViaMsGraph({ to, subject, html, fromName, env }) {
  const tenantId = env.MS_TENANT_ID;
  const clientId = env.MS_CLIENT_ID;
  const clientSecret = env.MS_CLIENT_SECRET;
  const userEmail = env.MS_USER_PRINCIPAL_NAME || env.ADMIN_EMAIL || 'info@anixi.se';

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('MS Graph credentials missing.');
  }

  // Get token
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  const tokenRes = await fetch(tokenUrl, { method: 'POST', body: params });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`MS Graph token error: ${tokenData.error_description || JSON.stringify(tokenData)}`);
  }

  const recipients = (Array.isArray(to) ? to : [to]).map(addr => ({
    emailAddress: { address: addr }
  }));

  const mailBody = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: html,
      },
      toRecipients: recipients,
    },
    saveToSentItems: 'true',
  };

  const sendRes = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/sendMail`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mailBody),
  });

  if (!sendRes.ok) {
    const errData = await sendRes.json().catch(() => null);
    throw new Error(`MS Graph sendMail failed (${sendRes.status}): ${errData?.error?.message || JSON.stringify(errData)}`);
  }

  return { provider: 'msgraph', success: true };
}

export async function sendEmail({ to, subject, html, fromName, fromEmail, env }) {
  const errors = [];

  // 1. Try Resend if configured
  if (env.RESEND_API_KEY) {
    try {
      return await sendViaResend({ to, subject, html, fromName, fromEmail, env });
    } catch (err) {
      console.error('Resend attempt failed:', err.message);
      errors.push(`Resend: ${err.message}`);
    }
  }

  // 2. Try MS Graph if configured
  if (env.MS_TENANT_ID && env.MS_CLIENT_ID && env.MS_CLIENT_SECRET) {
    try {
      return await sendViaMsGraph({ to, subject, html, fromName, env });
    } catch (err) {
      console.error('MS Graph sendMail attempt failed:', err.message);
      errors.push(`MS Graph: ${err.message}`);
    }
  }

  // 3. Try Webhook relay if configured
  if (env.EMAIL_WEBHOOK_URL) {
    try {
      const res = await fetch(env.EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, fromName, fromEmail }),
      });
      if (res.ok) {
        return await res.json();
      }
      errors.push(`Webhook: HTTP ${res.status}`);
    } catch (err) {
      errors.push(`Webhook: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' | '));
  }

  throw new Error('No email service configured (missing RESEND_API_KEY or MS_CLIENT_SECRET).');
}

