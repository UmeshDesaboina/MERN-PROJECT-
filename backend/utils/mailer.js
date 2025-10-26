const nodemailer = require('nodemailer');

let cachedTransporter = null;
let verifiedOnce = false;

function parseBool(val) {
  if (typeof val === 'boolean') return val;
  if (!val) return false;
  return ['true', '1', 'yes', 'on'].includes(String(val).toLowerCase());
}

async function createTransport() {
  const {
    SMTP_URL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SERVICE,
  } = process.env;

  if (SMTP_URL) {
    return nodemailer.createTransport(SMTP_URL);
  }

  if (SMTP_HOST) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: parseBool(SMTP_SECURE) || String(SMTP_PORT) === '465',
      auth: {
        user: SMTP_USER || EMAIL_USER,
        pass: SMTP_PASS || EMAIL_PASS,
      },
    });
  }

  if (EMAIL_USER && (EMAIL_PASS || process.env.GMAIL_APP_PASSWORD)) {
    return nodemailer.createTransport({
      service: EMAIL_SERVICE || 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS || process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Development fallback: use Ethereal for testing (not for production)
  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[mailer] Using Ethereal test SMTP account');
    return transporter;
  }

  throw new Error('Email not configured: set SMTP_URL or SMTP_HOST with SMTP_USER/SMTP_PASS, or EMAIL_USER/EMAIL_PASS');
}

async function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = await createTransport();
  }
  return cachedTransporter;
}

async function ensureEmailReady() {
  try {
    const transporter = await getTransporter();
    if (!verifiedOnce) {
      await transporter.verify();
      verifiedOnce = true;
      const opts = transporter.options || {};
      const info = {
        host: opts.host || opts.service || 'custom',
        port: opts.port,
        secure: opts.secure,
      };
      if (process.env.NODE_ENV !== 'production') {
        console.log('[mailer] Transport verified', info);
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[mailer] Email transport not ready:', err.message);
    }
    throw err;
  }
}

async function sendMail({ to, subject, text, html }) {
  const transporter = await getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

async function sendOtpEmail(to, code, purpose) {
  const appName = process.env.APP_NAME || 'Fight Wisdom';
  const subject = `${appName} OTP`;
  const text = `Welcome to ${appName}, your OTP is ${code}. It is valid for 5 minutes.`;
  const html = `<p>Welcome to <b>${appName}</b>, your OTP is <b>${code}</b>.</p><p>It is valid for <b>5 minutes</b>.</p>`;
  const info = await sendMail({ to, subject, text, html });
  if (process.env.NODE_ENV !== 'production' && nodemailer.getTestMessageUrl) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('[mailer] Preview URL:', url);
  }
  return info;
}

module.exports = { sendMail, sendOtpEmail, ensureEmailReady };
